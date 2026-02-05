"""
OCR Processor - KnowBot's "Eyes" for Scanned Documents.

This module provides the capability to "read" images and non-searchable PDFs.
It serves as a fallback for the RAG pipeline when standard text extraction fails.

KEY WORKFLOWS:
1. Image Extraction: Uses Tesseract (via pytesseract) to read .png, .jpg, etc.
2. PDF OCR: Converts scanned PDF pages into temporary images, then runs OCR on each.
3. Scanned Detection: Smart logic determines if a PDF has native text or needs OCR.

DEPENDENCIES:
- Tesseract-OCR: The underlying engine.
- Poppler: Needed for PDF -> Image conversion.
- Pytesseract/Pillow: Python wrappers for OCR and Image manipulation.
"""

import os
import tempfile
from pathlib import Path
from typing import List, Optional

# ... rest of the file ...

try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    import magic
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: OCR libraries not available. Scanned document support disabled.")


def is_ocr_available() -> bool:
    """Check if OCR dependencies are installed."""
    return OCR_AVAILABLE


def get_file_mime_type(file_path: str) -> str:
    """Detect the MIME type of a file."""
    if not OCR_AVAILABLE:
        # Fallback to extension-based detection
        ext = Path(file_path).suffix.lower()
        mime_map = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.tiff': 'image/tiff',
            '.tif': 'image/tiff',
            '.bmp': 'image/bmp',
            '.gif': 'image/gif',
        }
        return mime_map.get(ext, 'application/octet-stream')
    
    mime = magic.Magic(mime=True)
    return mime.from_file(file_path)


def is_image_file(file_path: str) -> bool:
    """Check if file is an image."""
    mime_type = get_file_mime_type(file_path)
    return mime_type.startswith('image/')


def is_pdf_file(file_path: str) -> bool:
    """Check if file is a PDF."""
    mime_type = get_file_mime_type(file_path)
    return mime_type == 'application/pdf'


def is_pdf_scanned(file_path: str) -> bool:
    """
    Check if a PDF is scanned (image-based) by attempting to extract text.
    If extraction yields very little text, it's likely scanned.
    """
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        
        text_content = ""
        # Check first few pages
        for page_num, page in enumerate(reader.pages[:3]):
            text_content += page.extract_text() or ""
            if len(text_content.strip()) > 100:
                # Found substantial text, not a scanned PDF
                return False
        
        # If we've checked pages but found very little text, it's likely scanned
        return len(text_content.strip()) < 50
        
    except Exception as e:
        print(f"Error checking PDF type: {e}")
        # If we can't read it normally, assume it might need OCR
        return True


def extract_text_from_image(image_path: str, language: str = 'eng') -> str:
    """
    Extract text from an image file using Tesseract OCR.
    
    Args:
        image_path: Path to the image file
        language: Tesseract language code (default: 'eng')
    
    Returns:
        Extracted text as a string
    """
    if not OCR_AVAILABLE:
        raise RuntimeError("OCR libraries not installed. Install pytesseract and Pillow.")
    
    try:
        print(f"DEBUG: Starting OCR for image: {image_path}")
        image = Image.open(image_path)
        print(f"DEBUG: Image loaded. Format: {image.format}, Size: {image.size}, Mode: {image.mode}")
        
        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if image.mode not in ('L', 'RGB'):
            image = image.convert('RGB')
            print("DEBUG: Converted image to RGB")
        
        text = pytesseract.image_to_string(image, lang=language)
        print(f"DEBUG: OCR Extraction complete. Text length: {len(text.strip())}")
        print(f"DEBUG: First 50 chars: {text.strip()[:50]}")
        return text.strip()
    
    except Exception as e:
        raise RuntimeError(f"OCR extraction failed for {image_path}: {e}")


def extract_text_from_pdf_ocr(pdf_path: str, language: str = 'eng', dpi: int = 300) -> List[dict]:
    """
    Extract text from a scanned PDF using OCR.
    Converts each page to an image and applies Tesseract.
    
    Args:
        pdf_path: Path to the PDF file
        language: Tesseract language code (default: 'eng')
        dpi: Resolution for PDF to image conversion (higher = better but slower)
    
    Returns:
        List of dicts with 'page' and 'text' for each page
    """
    if not OCR_AVAILABLE:
        raise RuntimeError("OCR libraries not installed. Install pytesseract, Pillow, and pdf2image.")
    
    results = []
    
    try:
        # Convert PDF pages to images
        with tempfile.TemporaryDirectory() as temp_dir:
            images = convert_from_path(
                pdf_path,
                dpi=dpi,
                output_folder=temp_dir,
                fmt='png'
            )
            
            for page_num, image in enumerate(images, start=1):
                # Apply OCR to each page image
                text = pytesseract.image_to_string(image, lang=language)
                
                results.append({
                    'page': page_num,
                    'text': text.strip()
                })
                
                print(f"OCR processed page {page_num}/{len(images)}")
        
        return results
    
    except Exception as e:
        raise RuntimeError(f"PDF OCR extraction failed for {pdf_path}: {e}")


def process_document_with_ocr(file_path: str, language: str = 'eng') -> List[dict]:
    """
    Process a document (image or PDF) using OCR if needed.
    
    Args:
        file_path: Path to the document
        language: OCR language
    
    Returns:
        List of dicts with extracted text and metadata
    """
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    if is_image_file(file_path):
        # Direct image file
        text = extract_text_from_image(file_path, language)
        return [{
            'page': 1,
            'text': text,
            'source': str(path.name),
            'ocr_applied': True
        }]
    
    elif is_pdf_file(file_path):
        if is_pdf_scanned(file_path):
            # Scanned PDF - use OCR
            print(f"Detected scanned PDF: {path.name}, applying OCR...")
            pages = extract_text_from_pdf_ocr(file_path, language)
            return [{
                'page': p['page'],
                'text': p['text'],
                'source': str(path.name),
                'ocr_applied': True
            } for p in pages]
        else:
            # Native text PDF - return None to signal standard processing
            return None
    
    else:
        raise ValueError(f"Unsupported file type for OCR: {path.suffix}")
