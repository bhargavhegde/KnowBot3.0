import streamlit as st
from pathlib import Path
from datetime import datetime
from rag_chain import load_and_chunk_documents, get_vector_store, build_rag_chain

# ==================== Page Config ====================
st.set_page_config(
    page_title="KnowBot - Personal RAG Chatbot",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better look
st.markdown("""
    <style>
    .stApp { background-color: #0f1117; color: #e0e0e0; }
    .stChatMessage { border-radius: 12px; padding: 1rem; margin: 0.8rem 0; }
    .citation-box {
        background-color: #1e2530;
        border-left: 4px solid #4a90e2;
        padding: 0.8rem;
        margin-top: 0.8rem;
        border-radius: 6px;
    }
    </style>
""", unsafe_allow_html=True)

# ==================== Session State ====================
if "messages" not in st.session_state:
    st.session_state.messages = []

if "custom_prompt" not in st.session_state:
    st.session_state.custom_prompt = None  # None means use default

# ==================== Sidebar ====================
with st.sidebar:
    st.header("🧠 KnowBot Controls")

    # Upload new files
    st.subheader("Upload Documents")
    uploaded_files = st.file_uploader(
        "PDF, TXT, MD files",
        type=["pdf", "txt", "md"],
        accept_multiple_files=True
    )

    if uploaded_files:
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        
        for file in uploaded_files:
            file_path = data_dir / file.name
            with open(file_path, "wb") as f:
                f.write(file.getbuffer())
            st.success(f"Saved: {file.name}")

        if st.button("🔄 Index / Update Now", type="primary"):
            with st.spinner("Processing documents..."):
                chunks = load_and_chunk_documents()
                get_vector_store(chunks)
                st.success("Documents indexed successfully!")
                st.rerun()

    # List & delete indexed files
    st.subheader("Current Documents")
    data_dir = Path("data")
    current_files = [f.name for f in data_dir.glob("*.*")] if data_dir.exists() else []

    if current_files:
        for fname in current_files:
            col1, col2 = st.columns([4, 1])
            col1.markdown(f"📄 {fname}")
            if col2.button("🗑", key=f"del_{fname}", help="Delete file"):
                try:
                    (data_dir / fname).unlink()
                    st.success(f"Deleted {fname}")
                    # Re-index after delete
                    with st.spinner("Re-indexing remaining documents..."):
                        chunks = load_and_chunk_documents()
                        get_vector_store(chunks)
                    st.rerun()
                except Exception as e:
                    st.error(f"Error: {e}")
    else:
        st.info("No documents yet. Upload some files.")

    # Custom prompt editor
    st.markdown("---")
    st.subheader("System Prompt")
    default_prompt_notice = "Using default safe prompt" if st.session_state.custom_prompt is None else "Custom prompt active"

    st.caption(default_prompt_notice)

    custom_input = st.text_area(
        "Customize prompt (leave empty to use default)",
        value="",
        height=140,
        placeholder="Enter your custom prompt here...\n{context} and {question} are required placeholders"
    )

    col_a, col_b = st.columns(2)
    if col_a.button("Apply Custom Prompt"):
        if custom_input.strip():
            st.session_state.custom_prompt = custom_input
            st.success("Custom prompt applied!")
        else:
            st.session_state.custom_prompt = None
            st.success("Reverted to default prompt")
        st.rerun()

    if col_b.button("Reset to Default"):
        st.session_state.custom_prompt = None
        st.success("Default prompt restored")
        st.rerun()

# ==================== Main Area ====================
st.title("🧠 KnowBot")
st.markdown("Your **local & private** personal knowledge assistant")

# Chat history display
for message in st.session_state.messages:
    role = message["role"]
    avatar = "🧑‍💻" if role == "user" else "🤖"
    
    with st.chat_message(role, avatar=avatar):
        st.markdown(message["content"])
        
        if "citations" in message and message["citations"]:
            with st.expander("📌 Sources", expanded=False):
                for i, cit in enumerate(message["citations"], 1):
                    st.markdown(
                        f"**Source {i}** ({cit['source']}):\n"
                        f"```text\n{cit['content'][:400]}{'...' if len(cit['content']) > 400 else ''}\n```",
                        unsafe_allow_html=True
                    )

# Chat input
if prompt := st.chat_input("Ask anything about your documents..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    with st.chat_message("user", avatar="🧑‍💻"):
        st.markdown(prompt)

    with st.chat_message("assistant", avatar="🤖"):
        message_placeholder = st.empty()
        full_response = ""
        citations = []

        try:
            # Build RAG components
            rag_result = build_rag_chain(custom_prompt=st.session_state.custom_prompt)
            chain = rag_result["chain"]
            retriever = rag_result["retriever"]

            # Get source documents for citations
            docs = retriever.invoke(prompt)
            
            for doc in docs:
                source = Path(doc.metadata.get("source", "unknown")).name
                content = doc.page_content.strip()
                citations.append({"source": source, "content": content})

            # Generate answer
            response = chain.invoke(prompt)
            full_response = response

            # Simple streaming effect
            for i in range(len(full_response)):
                message_placeholder.markdown(full_response[:i+1] + "▋")
            message_placeholder.markdown(full_response)

            # Save to history
            st.session_state.messages.append({
                "role": "assistant",
                "content": full_response,
                "citations": citations
            })

        except Exception as e:
            st.error(f"Something went wrong: {str(e)}")
            st.info("Check if Ollama is running (`ollama serve`) and models are pulled.")

# Bottom action buttons
col1, col2 = st.columns(2)
with col1:
    if st.button("🗑️ Clear Chat History"):
        st.session_state.messages = []
        st.rerun()

with col2:
    if st.button("📥 Export Chat"):
        if st.session_state.messages:
            chat_text = "\n\n".join(
                f"**{m['role'].upper()}** ({datetime.now().strftime('%Y-%m-%d %H:%M')}):\n{m['content']}"
                for m in st.session_state.messages
            )
            st.download_button(
                "Download as Markdown",
                chat_text,
                file_name=f"knowbot_chat_{datetime.now().strftime('%Y%m%d_%H%M')}.md",
                mime="text/markdown"
            )
        else:
            st.info("Nothing to export yet.")
