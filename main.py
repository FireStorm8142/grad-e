from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from typing import List, Optional, Annotated
import os
# Disable SSL verification for Hugging Face and other libraries
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['PYTHONHTTPSVERIFY'] = '0'

from dotenv import load_dotenv
load_dotenv(override=True)
from dotenv import load_dotenv
load_dotenv()
import shutil
import os
import uuid

from engine.router.logic import GradeRouter

app = FastAPI(title="GRAD-E API", version="1.0")
router = GradeRouter()

def save_upload(uploaded_file: UploadFile, destination_path: str):
    """Streams large PDFs to disk safely."""
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)

@app.post("/api/v1/exam/setup")
async def setup_exam(
    question_paper: UploadFile = File(...),
    answer_key: Optional[UploadFile] = File(None)
):
    """Endpoint 1: Upload reference materials and generate the JSON schema."""
    
    exam_id = f"exam_{uuid.uuid4().hex[:8]}"
    base_dir = f"engine/storage/inputs/{exam_id}"
    
    qp_path = f"{base_dir}/question_paper.pdf"
    save_upload(question_paper, qp_path)
    
    ak_path = None
    if answer_key:
        ak_path = f"{base_dir}/answer_key.pdf"
        save_upload(answer_key, ak_path)

    # Force the setup to use the Cloud Engine for instant schema generation
    setup_result = router.setup_exam_context(exam_id, qp_path, ak_path)
    
    if setup_result["status"] == "success":
        return {"status": "success", "exam_id": exam_id, "questions_extracted": setup_result["count"]}
    else:
        return {"status": "error", "message": "Failed to generate exam schema."}

@app.post("/api/v1/exam/{exam_id}/grade")
async def grade_batch(
    exam_id: str, 
    background_tasks: BackgroundTasks,
    student_scripts: Annotated[list[UploadFile], File()]
):
    """Endpoint 2: Upload student batches and trigger the Auto-Failover Router."""
    
    students_dir = f"engine/storage/inputs/{exam_id}/students"
    saved_files = []
    
    for script in student_scripts:
        file_path = f"{students_dir}/{script.filename}"
        save_upload(script, file_path)
        saved_files.append(file_path)
        
    # Send the grading workload to the background
    background_tasks.add_task(router.route_and_grade, exam_id, saved_files)
    
    return {
        "status": "processing",
        "job_id": f"job_{uuid.uuid4().hex[:8]}",
        "batch_size": len(saved_files),
        "message": "Batch received. Routing to primary cloud cluster..."
    }