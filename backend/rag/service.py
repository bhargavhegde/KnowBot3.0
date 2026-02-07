"""
RAG Service - The Core "Brain" of KnowBot.

This module implements the Retrieval Augmented Generation (RAG) pipeline.
It connects the specific user's query to their private documents and feeds that context to the LLM.

KEY COMPONENTS:

1. `DocumentProcessor` (Ingestion):
   - HOW IT WORKS: Takes a file path -> Reads content -> Splits into small chunks.
   - CONTEXT WINDOW STRATEGY: We split files into chunks of 800 characters with 150 overlap.
     This ensures that we can feed small, relevant pieces to the LLM without exceeding its
     token limit (typically 8k or 128k tokens). We don't feed the whole file!

2. `VectorStoreManager` (Long-Term Memory):
   - STORAGE: Uses ChromaDB to store "Embeddings" (vectors representing text meaning).
   - ISOLATION: Each chunk matches a `user_id`. When searching, we strict-filter by this ID
     so users never see each other's data.

3. `RAGEngine` (The Thinking Process):
   - RETRIEVAL: Converts user question to vector -> finds top 5 closest chunks in ChromaDB.
   - GENERATION: Combines [System Prompt] + [Top 5 Chunks] + [User Question] -> LLM.
   - HYBRID SEARCH: Optionally combines Keyword search (BM25) with Semantic search (Vectors)
     for better accuracy.

Refactored to use chromadb.PersistentClient to fix HNSW index errors.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any

from django.conf import settings

import chromadb
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_openai import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document as LangchainDocument

# OCR support for scanned documents
try:
    from rag.ocr import process_document_with_ocr, is_ocr_available, is_image_file
    OCR_ENABLED = is_ocr_available()
except ImportError:
    OCR_ENABLED = False
    print("Warning: OCR module not available")

# Hybrid search (BM25 + Semantic)
try:
    from rag.hybrid_search import (
        is_bm25_available, update_bm25_index, create_hybrid_retriever, get_bm25_index
    )
    HYBRID_SEARCH_ENABLED = is_bm25_available()
except ImportError:
    HYBRID_SEARCH_ENABLED = False
    print("Warning: Hybrid search module not available")


# Configuration from Django settings
CHUNK_SIZE = 800      # Characters per chunk (Context Window optimization)
CHUNK_OVERLAP = 150   # Overlap ensures context isn't cut mid-sentence
EMBEDDING_MODEL = getattr(settings, 'EMBEDDING_MODEL', 'nomic-embed-text')
LLM_MODEL = getattr(settings, 'LLM_MODEL', 'llama3.1:8b')
CHROMA_DIR = str(getattr(settings, 'CHROMA_DIR', './chroma_db'))
DATA_DIR = str(getattr(settings, 'DATA_DIR', './data'))
OLLAMA_HOST = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
LLM_PROVIDER = getattr(settings, 'LLM_PROVIDER', 'ollama')
GROQ_API_KEY = getattr(settings, 'GROQ_API_KEY', '')
GROQ_MODEL = getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile')
EMBEDDING_PROVIDER = getattr(settings, 'EMBEDDING_PROVIDER', 'ollama')
OPENAI_API_KEY = getattr(settings, 'OPENAI_API_KEY', '')
HUGGINGFACE_API_KEY = getattr(settings, 'HUGGINGFACE_API_KEY', '')

# Global client singleton to prevent file locking/HNSW errors
_CHROMA_CLIENT = None

def get_chroma_client(persist_directory: str = None):
    """
    Singleton pattern for ChromaDB client.
    Prevents multiple connections locking the SQLite database file.
    """
    global _CHROMA_CLIENT
    if _CHROMA_CLIENT is None:
        chroma_host = os.environ.get('CHROMA_HOST')
        chroma_port = os.environ.get('CHROMA_PORT', '8000')
        
        if chroma_host:
            print(f"Connecting to ChromaDB Server at {chroma_host}:{chroma_port}")
            _CHROMA_CLIENT = chromadb.HttpClient(host=chroma_host, port=int(chroma_port))
        else:
            print(f"Using local PersistentClient at {persist_directory}")
            path = persist_directory or CHROMA_DIR
            _CHROMA_CLIENT = chromadb.PersistentClient(path=path)
            
    return _CHROMA_CLIENT


class DocumentProcessor:
    """
    Handles document loading and chunking (Ingestion Phase).
    
    CRITICAL FOR CONTEXT WINDOW:
    We cannot feed entire PDFs to the LLM. This class breaks them down into
    manageable `CHUNK_SIZE` blocks (e.g. 800 chars).
    """
    
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            add_start_index=True,
        )
    
    def load_single_document(self, file_path: str, user_id: int = None, original_filename: str = None) -> List:
        """
        Load a single document and return chunks with user metadata.
        
        Args:
            file_path: Absolute path to file on disk.
            user_id: The ID of the owner (CRITICAL for data isolation).
            original_filename: Display name of the file.
        """
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        ext = path.suffix.lower()
        documents = []
        
        # Use provided filename or fallback to path name
        source_name = original_filename or path.name
        
        # Check if this is an image file - use OCR
        if ext in ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.bmp', '.gif']:
            if not OCR_ENABLED:
                raise ValueError(f"OCR is required for image files but not available: {ext}")
            
            ocr_results = process_document_with_ocr(str(path))
            for result in ocr_results:
                doc = LangchainDocument(
                    page_content=result['text'],
                    metadata={
                        'source': source_name,
                        'file_path': str(path),
                        'page': result.get('page', 1),
                        'ocr_applied': True
                    }
                )
                documents.append(doc)
        
        elif ext == '.pdf':
            # Try OCR first for scanned PDFs
            if OCR_ENABLED:
                ocr_results = process_document_with_ocr(str(path))
                if ocr_results is not None:  # None means PDF has native text
                    print(f"Using OCR for scanned PDF: {path.name}")
                    for result in ocr_results:
                        doc = LangchainDocument(
                            page_content=result['text'],
                            metadata={
                                'source': source_name,
                                'file_path': str(path),
                                'page': result.get('page', 1),
                                'ocr_applied': True
                            }
                        )
                        documents.append(doc)
            
            # If no OCR results, use standard PDF loader
            if not documents:
                loader = PyPDFLoader(str(path))
                documents = loader.load()
        
        elif ext in ['.txt', '.md']:
            loader = TextLoader(str(path))
            documents = loader.load()
        
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        
        chunks = self.text_splitter.split_documents(documents)
        
        # Add metadata locally
        for chunk in chunks:
            # Ensure source is the friendly name, not the UUID path
            chunk.metadata['source'] = source_name
            chunk.metadata['file_path'] = str(path)
            
            # Add user_id for filtering
            if user_id is not None:
                chunk.metadata['user_id'] = str(user_id)
        
        return chunks
    
    def load_all_documents(self, directory: str = None) -> List:
        """Load all documents from a directory."""
        directory = directory or DATA_DIR
        data_path = Path(directory)
        
        if not data_path.exists():
            return []
        
        all_chunks = []
        
        # Process PDFs
        for pdf_file in data_path.glob("**/*.pdf"):
            try:
                chunks = self.load_single_document(str(pdf_file))
                all_chunks.extend(chunks)
            except Exception as e:
                print(f"Error loading {pdf_file}: {e}")
        
        # Process TXT files
        for txt_file in data_path.glob("**/*.txt"):
            try:
                chunks = self.load_single_document(str(txt_file))
                all_chunks.extend(chunks)
            except Exception as e:
                print(f"Error loading {txt_file}: {e}")
        
        # Process MD files
        for md_file in data_path.glob("**/*.md"):
            try:
                chunks = self.load_single_document(str(md_file))
                all_chunks.extend(chunks)
            except Exception as e:
                print(f"Error loading {md_file}: {e}")
        
        # Process image files (OCR)
        if OCR_ENABLED:
            for img_ext in ['png', 'jpg', 'jpeg', 'tiff', 'tif', 'bmp']:
                for img_file in data_path.glob(f"**/*.{img_ext}"):
                    try:
                        chunks = self.load_single_document(str(img_file))
                        all_chunks.extend(chunks)
                    except Exception as e:
                        print(f"Error loading image {img_file}: {e}")
        
        print(f"Loaded and chunked {len(all_chunks)} pieces from documents.")
        return all_chunks


class VectorStoreManager:
    """
    Manages ChromaDB vector store operations.
    
    This class handles the interface with the Vector Database.
    It stamps every vector with `user_id` upon creation to ensure data privacy.
    """
    
    def __init__(self, persist_directory: str = CHROMA_DIR, user_id: int = None):
        self.persist_directory = persist_directory
        self.user_id = user_id
        self.collection_name = "knowbot_docs"
        self._embeddings = None
        # Initialize client explicitly using singleton
        self.client = get_chroma_client(persist_directory)

    @property
    def embeddings(self):
        """Lazy loader for embedding model to save memory."""
        if self._embeddings is None:
            if EMBEDDING_PROVIDER == 'openai':
                print("Using OpenAI Embeddings")
                self._embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=OPENAI_API_KEY)
            elif EMBEDDING_PROVIDER == 'huggingface':
                print("Using HuggingFace Embeddings (Local/In-container)")
                self._embeddings = HuggingFaceEmbeddings(
                    model_name="all-MiniLM-L6-v2",
                    model_kwargs={'device': 'cpu'}
                )
            else:
                print(f"Using Ollama Embeddings at {OLLAMA_HOST}")
                self._embeddings = OllamaEmbeddings(
                    model=EMBEDDING_MODEL,
                    base_url=OLLAMA_HOST
                )
        return self._embeddings
    
    def create_vector_store(self, chunks: List) -> Chroma:
        """Create or add to vector store from document chunks."""
        if not chunks:
            raise ValueError("No chunks provided to create vector store")
        
        # Add user_id to each chunk's metadata if not already set
        if self.user_id is not None:
            for chunk in chunks:
                if 'user_id' not in chunk.metadata:
                    chunk.metadata['user_id'] = str(self.user_id)
        
        vector_store = Chroma(
            client=self.client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
        )
        
        vector_store.add_documents(chunks)
        print(f"Added {len(chunks)} chunks to vector store for user {self.user_id}")
        
        # Also update BM25 index for hybrid search
        if HYBRID_SEARCH_ENABLED:
            update_bm25_index(chunks, user_id=self.user_id)
            print(f"Updated BM25 index with {len(chunks)} chunks")
        
        return vector_store
    
    def delete_from_vector_store(self, file_path: str):
        """Delete all vectors associated with a specific file path."""
        try:
            collection = self.client.get_collection(self.collection_name)
            # Try deleting by file_path usage in metadata (new schema)
            collection.delete(where={"file_path": file_path})
            # Also try deleting by source (legacy/fallback)
            collection.delete(where={"source": file_path})
            print(f"Deleted vectors for {file_path}")
        except Exception as e:
            print(f"Error deleting vectors for {file_path}: {e}")
            
    def reset_vector_store(self):
        """Delete entire collection for the user."""
        try:
            collection = self.client.get_collection(self.collection_name)
            if self.user_id:
                collection.delete(where={"user_id": str(self.user_id)})
                print(f"Deleted all vectors for user {self.user_id}")
            else:
                self.client.delete_collection(self.collection_name)
                print("Deleted entire collection")
        except Exception as e:
            print(f"Error resetting vector store: {e}")
    
    def load_vector_store(self) -> Chroma:
        """Load existing vector store."""
        vector_store = Chroma(
            client=self.client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
        )
        print(f"Loaded vector store for user {self.user_id}")
        return vector_store
    
    def get_or_create_vector_store(self, chunks: List = None) -> Chroma:
        """Get existing vector store or create new one if chunks provided."""
        if chunks:
            return self.create_vector_store(chunks)
        return self.load_vector_store()


class RAGEngine:
    """
    Main RAG engine for building and executing RAG chains with multi-user support.
    
    CONTEXT MANAGEMENT:
    This class is responsible for the "R" in RAG (Retrieval).
    It ensures that when a user asks a question, we only retrieve their documents.
    """
    
    DEFAULT_TEMPLATE = """You are a helpful, accurate assistant that answers questions based ONLY on the provided context.
You have access to a neural knowledge base containing the documents listed below. 
Use markdown formatting when appropriate.
If the answer is not in the context, politely mention that you couldn't find it in the specific documents provided.

Documents currently in your neural memory:
{file_list}

Context: {context}
Question: {question}

Answer:"""
    
    def __init__(self, custom_prompt: Optional[str] = None, user_id: int = None):
        self.custom_prompt = custom_prompt
        self.user_id = user_id
        if LLM_PROVIDER == 'groq':
            if not GROQ_API_KEY:
                print("Warning: GROQ_API_KEY not found. Falling back to Ollama.")
                self.llm = ChatOllama(
                    model=LLM_MODEL,
                    temperature=0.2,
                    base_url=OLLAMA_HOST
                )
            else:
                print(f"Using Groq LLM: {GROQ_MODEL}")
                self.llm = ChatGroq(
                    model=GROQ_MODEL,
                    temperature=0.2,
                    groq_api_key=GROQ_API_KEY
                )
        else:
            print(f"Using Ollama LLM: {LLM_MODEL}")
            self.llm = ChatOllama(
                model=LLM_MODEL,
                temperature=0.2,
                base_url=OLLAMA_HOST
            )
        self.vector_store_manager = VectorStoreManager(user_id=user_id)
        self.indexed_files = self._get_indexed_files()
    
    def _get_indexed_files(self) -> List[str]:
        """Fetch list of indexed filenames for the user."""
        try:
            from api.models import Document
            docs = Document.objects.filter(user_id=self.user_id, index_status='indexed')
            return [doc.original_filename for doc in docs]
        except Exception:
            return []

    def build_prompt(self, has_history: bool = False) -> ChatPromptTemplate:
        """Build the prompt template with optional custom instructions and history support."""
        file_list_str = "\n".join([f"- {f}" for f in self.indexed_files]) if self.indexed_files else "No documents indexed."
        
        history_placeholder = "{chat_history}\n" if has_history else ""
        
        if self.custom_prompt and self.custom_prompt.strip():
            template = f"""{self.DEFAULT_TEMPLATE.rstrip()}

{history_placeholder}
Additional instructions from manager:
{self.custom_prompt.strip()}

Documents currently in your neural memory:
{file_list_str}

Context: {{context}}
Question: {{question}}

Answer:"""
        else:
            template = self.DEFAULT_TEMPLATE.replace("{file_list}", file_list_str)
            if has_history:
                # Insert history before the question in the default template
                template = template.replace("Question: {question}", f"{history_placeholder}\nQuestion: {{question}}")
        
        return ChatPromptTemplate.from_template(template)
    
    def get_retriever(self, k: int = 5, use_hybrid: bool = True):
        """
        Get retriever from vector store with user-specific filtering.
        
        ARGS:
            k (int): LIMIT on how many chunks to retrieve (e.g., 5).
                     This is the key to managing the CONTEXT WINDOW.
                     We can't feed a million docs; we pick the Top 5 most relevant.
            
            use_hybrid (bool): If True, mixes Keyword search (BM25) with vector search.
        """
        vector_store = self.vector_store_manager.load_vector_store()
        
        # Base vector retriever with user filtering
        if self.user_id is not None:
            # THIS IS THE KEY SECURITY FEATURE (Metadta Filtering)
            # Only retrieve vectors where metadata['user_id'] == current_user
            vector_retriever = vector_store.as_retriever(
                search_kwargs={
                    "k": k,
                    "filter": {"user_id": str(self.user_id)}
                }
            )
        else:
            vector_retriever = vector_store.as_retriever(search_kwargs={"k": k})
        
        # Use hybrid retriever if available and enabled
        if use_hybrid and HYBRID_SEARCH_ENABLED:
            try:
                hybrid_retriever = create_hybrid_retriever(
                    vector_retriever=vector_retriever,
                    user_id=self.user_id,
                    semantic_weight=0.6,
                    bm25_weight=0.4
                )
                print(f"Using hybrid retriever (60% semantic, 40% BM25)")
                return hybrid_retriever
            except Exception as e:
                print(f"Hybrid retriever failed, falling back to vector: {e}")
                return vector_retriever
        
        return vector_retriever
    
    def build_chain(self, chat_history: List = None):
        """Build the complete RAG chain with optional history."""
        retriever = self.get_retriever()
        has_history = chat_history is not None and len(chat_history) > 0
        prompt = self.build_prompt(has_history=has_history)
        
        def format_docs(docs):
            return "\n\n".join(
                f"[Source: {doc.metadata.get('source', 'unknown')}]\n{doc.page_content}"
                for doc in docs
            )
        
        if has_history:
            chain = (
                {
                    "context": retriever | format_docs,
                    "question": RunnablePassthrough(),
                    "chat_history": lambda x: chat_history
                }
                | prompt
                | self.llm
                | StrOutputParser()
            )
        else:
            chain = (
                {"context": retriever | format_docs, "question": RunnablePassthrough()}
                | prompt
                | self.llm
                | StrOutputParser()
            )
        
        return {
            "chain": chain,
            "retriever": retriever
        }
    
    def query(self, question: str, chat_history: List = None) -> Dict[str, Any]:
        """Execute a RAG query and return response with citations."""
        rag_result = self.build_chain(chat_history=chat_history)
        chain = rag_result["chain"]
        # Get source documents with scores for confidence check
        try:
            # We need the vector store directly to get scores
            vector_store = self.vector_store_manager.load_vector_store()
            
            # Using same k and filter as get_retriever
            search_kwargs = {"k": 5}
            if self.user_id:
                search_kwargs["filter"] = {"user_id": str(self.user_id)}
                
            docs_with_scores = vector_store.similarity_search_with_score(question, **search_kwargs)
            
            # CHROMA DISTANCE METRIC: Lower is better (0 = identical)
            # Threshold: > 3.0 means extremely poor match.
            # We are setting this very high to prioritize local documents.
            
            best_score = docs_with_scores[0][1] if docs_with_scores else float('inf')
            steps = ["Retrieving relevant documents..."]
            
            # Auto-Trigger Web Search ONLY if truly zero or garbage matches
            suggested_action = None
            
            # Use 1.2 threshold for "Low Confidence" warning to be more proactive
            # Scores > 1.2 (but < 3.0) often mean partial or weak matches
            if not docs_with_scores or best_score > 1.2:
                if not docs_with_scores:
                    steps.append("⚠️ No relevant documents found (Score: inf)...")
                    steps.append("Using general knowledge/LLM only.")
                else:
                    steps.append(f"Low relevance detected (Score: {best_score:.2f})...")
                    steps.append("Answering based on weak matches as requested.")
                
                steps.append("Suggesting Web Search fallback to user...")
                suggested_action = "web_search"
            else:
                steps.append(f"High relevance found (Score: {best_score:.2f})...")
                steps.append("Synthesizing answer from documents...")
            
            # Unpack docs for the chain
            docs = [doc for doc, _ in docs_with_scores]
            
        except Exception as e:
            print(f"⚠️ Retrieval error (caught): {e}")
            docs = []
            steps = ["Retrieval error, falling back to general knowledge..."]
            if 'suggested_action' not in locals():
                suggested_action = "web_search"
        
        citations = []
        
        for doc in docs:
            # metadata 'source' should be the original filename
            source = doc.metadata.get("source", "unknown")
            content = doc.page_content.strip()
            citations.append({
                "source": source,
                "content": content,
                "page": doc.metadata.get("page", None)
            })
        
        # Generator answer using the chain (re-using build_chain logic logic but manually feeding docs)
        # We need to re-construct the chain input manually since we bypassed the retriever
        
        rag_chain = self.build_chain(chat_history)["chain"]
        
        # We need to override the retriever in the chain OR just format docs manually
        # Easier to use the prompts directly since we already have the docs
        
        context_str = "\n\n".join([f"[Source: {d.metadata.get('source', 'unknown')}]\n{d.page_content}" for d in docs])
        
        has_history = chat_history is not None and len(chat_history) > 0
        history_placeholder = "{chat_history}\n" if has_history else ""
        
        template = f"""You are a helpful, accurate assistant that answers questions based ONLY on the provided context.
If the answer is not in the context, politely mention that you couldn't find it in the specific documents provided.

Context:
{context_str}

{history_placeholder}Question: {{question}}

Answer:"""
        
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm | StrOutputParser()
        
        input_data = {"question": question}
        if has_history:
            input_data["chat_history"] = chat_history
            
        response = chain.invoke(input_data)
        

        if 'suggested_action' not in locals():
            suggested_action = None

        return {
            "response": response,
            "citations": citations,
            "steps": steps,
            "suggested_action": suggested_action
        }

    def general_query(self, question: str, chat_history: List = None) -> Dict[str, Any]:
        """Execute a general LLM query without RAG context."""
        thinking_steps = ["Analyzing request...", "Checking knowledge base...", "No documents found, using general knowledge..."]
        
        has_history = chat_history is not None and len(chat_history) > 0
        history_placeholder = "{chat_history}\n" if has_history else ""
        
        template = f"""You are KnowBot, a helpful AI assistant.
        
{history_placeholder}Question: {{question}}

Answer:"""
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm | StrOutputParser()
        
        input_data = {"question": question}
        if has_history:
            input_data["chat_history"] = chat_history
            
        response = chain.invoke(input_data)
        

        return {
            "response": response,
            "citations": [],
            "steps": thinking_steps,
            "suggested_action": "web_search"
        }

    def web_search_query(self, question: str, chat_history: List = None) -> Dict[str, Any]:
        """Execute a WEB SEARCH query using Tavily API."""
        import os
        from tavily import TavilyClient
        
        tavily_key = os.environ.get("TAVILY_API_KEY")
        if not tavily_key:
            return self.general_query(question, chat_history)

        thinking_steps = ["Analyzing request..."]
        
        # 1. Reformulate Query if History Exists (Contextualize)
        search_query = question
        if chat_history and len(chat_history) > 0:
            thinking_steps.append("Contextualizing search query...")
            try:
                reform_template = """Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone search query.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:"""
                reform_prompt = ChatPromptTemplate.from_template(reform_template)
                reform_chain = reform_prompt | self.llm | StrOutputParser()
                # We need to serialize history to string for this specific prompt
                history_str = "\n".join([f"{msg.type}: {msg.content}" for msg in chat_history])
                
                search_query = reform_chain.invoke({"chat_history": history_str, "question": question})
                print(f"Reformulated '{question}' to '{search_query}'")
                thinking_steps.append(f"Refined Query: {search_query}")
            except Exception as e:
                print(f"Query reformulation failed: {e}")

        thinking_steps.append("Searching the web...")
        
        try:
            tavily = TavilyClient(api_key=tavily_key)
            # Use the REFORMULATED query for the search
            search_result = tavily.search(query=search_query, search_depth="advanced")
            thinking_steps.append("Reading search results...")
            
            # Format context from web results
            web_context = "\n\n".join([
                f"Source: {res['url']}\nTitle: {res['title']}\nContent: {res['content']}" 
                for res in search_result.get('results', [])[:3]
            ])
            
            thinking_steps.append("Synthesizing answer...")
            
            # Build prompt with web context
            has_history = chat_history is not None and len(chat_history) > 0
            history_placeholder = "{chat_history}\n" if has_history else ""
            
            template = f"""You are KnowBot, a helpful AI assistant with live web access.
            
Use the following search results to answer the user's question accurately.
Always cite your sources using the URLs provided.

Web Search Results:
{web_context}

{history_placeholder}Question: {{question}}

Answer:"""
            
            prompt = ChatPromptTemplate.from_template(template)
            chain = prompt | self.llm | StrOutputParser()
            
            input_data = {"question": question}
            if has_history:
                input_data["chat_history"] = chat_history
                
            response = chain.invoke(input_data)
            
            return {
                "response": response,
                "citations": [{"source": res['url'], "content": res['content']} for res in search_result.get('results', [])[:3]],
                "steps": thinking_steps
            }
            
        except Exception as e:
            print(f"Web search failed: {e}")
            thinking_steps.append("Web search failed, falling back to internal knowledge.")
            return self.general_query(question, chat_history)


# Convenience functions for backward compatibility
def load_and_chunk_documents(directory: str = None) -> List:
    """Load and chunk all documents from directory."""
    processor = DocumentProcessor()
    return processor.load_all_documents(directory)


def get_vector_store(chunks: List = None, user_id: int = None) -> Chroma:
    """Get or create vector store."""
    manager = VectorStoreManager(user_id=user_id)
    return manager.get_or_create_vector_store(chunks)


def build_rag_chain(custom_prompt: Optional[str] = None, user_id: int = None) -> Dict[str, Any]:
    """Build RAG chain with optional custom prompt."""
    engine = RAGEngine(custom_prompt=custom_prompt, user_id=user_id)
    return engine.build_chain()
