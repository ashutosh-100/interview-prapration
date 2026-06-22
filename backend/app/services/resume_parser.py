import re
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader
from app.services.ai_service import AIService

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extracts text content from a PDF file."""
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            text = f"Error reading PDF: {e}"
        return text

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extracts text content from a DOCX file without external dependencies."""
        text = ""
        try:
            with zipfile.ZipFile(file_path) as docx:
                xml_content = docx.read('word/document.xml')
                root = ET.fromstring(xml_content)
                # DOCX XML namespace
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                
                # Gather all text elements
                paragraphs = []
                for p in root.findall('.//w:p', ns):
                    p_text = ""
                    for r in p.findall('.//w:t', ns):
                        if r.text:
                            p_text += r.text
                    if p_text:
                        paragraphs.append(p_text)
                text = "\n".join(paragraphs)
        except Exception as e:
            text = f"Error reading DOCX: {e}"
        return text

    @classmethod
    def parse_resume_file(cls, file_path: str) -> dict:
        """Reads resume file (PDF/DOCX) and processes with AI Service for structure."""
        text = ""
        if file_path.lower().endswith(".pdf"):
            text = cls.extract_text_from_pdf(file_path)
        elif file_path.lower().endswith(".docx"):
            text = cls.extract_text_from_docx(file_path)
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX.")

        # Clean text
        text = re.sub(r'\s+', ' ', text).strip()
        
        if not text or len(text) < 10:
            raise ValueError("Resume file appears to be empty or unreadable.")

        # Parse text using AIService
        return AIService.parse_resume(text)
