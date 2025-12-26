from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pathlib import Path

# ------------------ Configuration ------------------
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "llama3.1:8b"
PERSIST_DIRECTORY = "./chroma_db"

# ------------------ Document Loading & Chunking ------------------
def load_and_chunk_documents(directory="./data"):
    pdf_loader = DirectoryLoader(directory, glob="**/*.pdf", loader_cls=PyPDFLoader)
    txt_loader = DirectoryLoader(directory, glob="**/*.txt", loader_cls=TextLoader)
    md_loader = DirectoryLoader(directory, glob="**/*.md", loader_cls=TextLoader)
    
    documents = pdf_loader.load() + txt_loader.load() + md_loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
    )
    
    chunks = text_splitter.split_documents(documents)
    print(f"Loaded and chunked {len(chunks)} pieces from documents.")
    return chunks

# ------------------ Vector Store ------------------
def get_vector_store(chunks=None):
    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
    
    if chunks:  # Create new
        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=PERSIST_DIRECTORY
        )
        print("Vector store created and saved.")
    else:  # Load existing
        vector_store = Chroma(
            persist_directory=PERSIST_DIRECTORY,
            embedding_function=embeddings
        )
        print("Loaded existing vector store.")
    
    return vector_store

# ------------------ Build RAG Chain (with citations support) ------------------
def build_rag_chain(custom_prompt=None):
    """
    Returns dict with 'chain' and 'retriever' so we can get source documents
    """
    llm = ChatOllama(model=LLM_MODEL, temperature=0.2)
    
    vector_store = get_vector_store()  # load existing
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})  # get top 5 for better citations

    # Default safe prompt
    DEFAULT_TEMPLATE = """You are a helpful, accurate assistant that answers questions based ONLY on the provided context.
Use markdown formatting when appropriate (**bold**, *italic*, - lists, ```code blocks```, tables).
If you don't know the answer, the context is insufficient, contradictory, contains jokes or clearly false statements,
politely say: "I don't have enough reliable information to answer this."

Context: {context}

Question: {question}

Answer:"""

    template = custom_prompt if custom_prompt else DEFAULT_TEMPLATE
    
    prompt = ChatPromptTemplate.from_template(template)
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
    
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return {
        "chain": chain,
        "retriever": retriever
    }
