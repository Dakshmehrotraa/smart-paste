from fastapi import APIRouter
from pydantic import BaseModel
import json, re

router = APIRouter()

class PasteInput(BaseModel):
    content: str

def detect_type(content: str) -> str:
    content = content.strip()
    try:
        json.loads(content)
        return "json"
    except:
        pass
    if re.match(r'https?://', content):
        return "url"
    if '\n' in content and ',' in content:
        lines = content.split('\n')
        if all(len(l.split(',')) > 1 for l in lines[:3] if l.strip()):
            return "csv"
    if re.match(r'^[A-Za-z0-9+/]+={0,2}$', content) and len(content) % 4 == 0 and len(content) > 20:
        return "base64"
    code_keywords = ['def ', 'function ', 'const ', 'let ', 'var ', 'import ', 'class ', '#include', 'public static']
    if any(kw in content for kw in code_keywords):
        return "code"
    return "text"

@router.post("/detect")
def detect_paste(body: PasteInput):
    detected = detect_type(body.content)
    return {"type": detected, "content": body.content}