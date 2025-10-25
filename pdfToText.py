from PyPDF2 import PdfReader
from io import BytesIO

def extract_pdf_text(pdf_bytes: bytes) -> str:
    pdf_stream = BytesIO(pdf_bytes)
    reader = PdfReader(pdf_stream)
    text_content = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_content.append(page_text)
    return "\n".join(text_content)