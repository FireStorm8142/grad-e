import requests

# 1. Put your actual exam_id here from Test Case 1
EXAM_ID = "exam_c8128000" 
URL = f"http://localhost:8000/api/v1/exam/{EXAM_ID}/grade"

# 2. Point this to 2 or 3 PDF files on your computer to test the batch
# (You can just upload the algorithm paper twice to test the system)

pdf_path = r"C:\Users\Johan\Downloads\Algorithm paper (2).pdf"

files_to_upload = [
    ('student_scripts', ('student1.pdf', open(pdf_path, 'rb'), 'application/pdf')),
    ('student_scripts', ('student2.pdf', open(pdf_path, 'rb'), 'application/pdf'))
]

print(f"🚀 Sending batch to {URL}...")
response = requests.post(URL, files=files_to_upload)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")