"""
RAG Service - Migrated from Streamlit rag_chain.py

This module provides the core RAG functionality:
- Document loading and chunking
- Vector store management (ChromaDB)
- RAG chain building and execution

Refactored to use chromadb.PersistentClient to fix HNSW index errors.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any

from django.conf import settings

import chromadb
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


# Configuration from Django settings
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
EMBEDDING_MODEL = getattr(settings, 'EMBEDDING_MODEL', 'nomic-embed-text')
LLM_MODEL = getattr(settings, 'LLM_MODEL', 'llama3.1:8b')
CHROMA_DIR = str(getattr(settings, 'CHROMA_DIR', './chroma_db'))
DATA_DIR = str(getattr(settings, 'DATA_DIR', './data'))
OLLAMA_HOST = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')

# Global client singleton to prevent file locking/HNSW errors
_CHROMA_CLIENT = None

def get_chroma_client(persist_directory: str):
    global _CHROMA_CLIENT
    if _CHROMA_CLIENT is None:
        _CHROMA_CLIENT = chromadb.PersistentClient(path=persist_directory)
    return _CHROMA_CLIENT


class DocumentProcessor:
    """Handles document loading and chunking."""
    
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            add_start_index=True,
        )
    
    def load_single_document(self, file_path: str, user_id: int = None) -> List:
        """Load a single document and return chunks with user metadata."""
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        ext = path.suffix.lower()
        
        if ext == '.pdf':
            loader = PyPDFLoader(str(path))
        elif ext in ['.txt', '.md']:
            loader = TextLoader(str(path))
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        
        documents = loader.load()
        chunks = self.text_splitter.split_documents(documents)
        
        # Add user_id to metadata for filtering
        if user_id is not None:
            for chunk in chunks:
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
        
        print(f"Loaded and chunked {len(all_chunks)} pieces from documents.")
        return all_chunks


class VectorStoreManager:
    """Manages ChromaDB vector store operations using PersistentClient."""
    
    def __init__(self, persist_directory: str = CHROMA_DIR, user_id: int = None):
        self.persist_directory = persist_directory
        self.user_id = user_id
        self.collection_name = "knowbot_docs"
        self.embeddings = OllamaEmbeddings(
            model=EMBEDDING_MODEL,
            base_url=OLLAMA_HOST
        )
        # Initialize client explicitly using singleton
        self.client = get_chroma_client(persist_directory)
    
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
        return vector_store
    
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
    """Main RAG engine for building and executing RAG chains with multi-user support."""
    
    DEFAULT_TEMPLATE = """You are a helpful, accurate assistant that answers questions based ONLY on the provided context.
Use markdown formatting when appropriate.
If you don't know the answer, the context is insufficient, contradictory, or contains jokes/false statements,
politely mention it.

Context: {context}
Question: {question}

Answer:"""
    
    def __init__(self, custom_prompt: Optional[str] = None, user_id: int = None):
        self.custom_prompt = custom_prompt
        self.user_id = user_id
        self.llm = ChatOllama(
            model=LLM_MODEL,
            temperature=0.2,
            base_url=OLLAMA_HOST
        )
        self.vector_store_manager = VectorStoreManager(user_id=user_id)
    
    def build_prompt(self) -> ChatPromptTemplate:
        """Build the prompt template with optional custom instructions."""
        if self.custom_prompt and self.custom_prompt.strip():
            template = f"""{self.DEFAULT_TEMPLATE.rstrip()}

Additional instructions from user:
{self.custom_prompt.strip()}

Context: {{context}}
Question: {{question}}

Answer:"""
        else:
            template = self.DEFAULT_TEMPLATE
        
        return ChatPromptTemplate.from_template(template)
    
    def get_retriever(self, k: int = 5):
        """Get retriever from vector store with user-specific filtering."""
        vector_store = self.vector_store_manager.load_vector_store()
        
        # Use metadata filtering to only retrieve user's documents
        if self.user_id is not None:
            return vector_store.as_retriever(
                search_kwargs={
                    "k": k,
                    "filter": {"user_id": str(self.user_id)}
                }
            )
        return vector_store.as_retriever(search_kwargs={"k": k})
    
    def build_chain(self):
        """Build the complete RAG chain."""
        retriever = self.get_retriever()
        prompt = self.build_prompt()
        
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
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
    
    def query(self, question: str) -> Dict[str, Any]:
        """Execute a RAG query and return response with citations."""
        rag_result = self.build_chain()
        chain = rag_result["chain"]
        retriever = rag_result["retriever"]
        
        # Get source documents for citations
        docs = retriever.invoke(question)
        citations = []
        
        for doc in docs:
            source = Path(doc.metadata.get("source", "unknown")).name
            content = doc.page_content.strip()
            citations.append({
                "source": source,
                "content": content,
                "page": doc.metadata.get("page", None)
            })
        
        # Generate answer
        response = chain.invoke(question)
        
        return {
            "response": response,
            "citations": citations
        }


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
