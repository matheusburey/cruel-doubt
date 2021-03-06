from fastapi import FastAPI
from app.routers import routers
from fastapi.middleware.cors import CORSMiddleware
from app.configs.config import settings

origins = [settings.url_cors]

app = FastAPI(title="cruel-doubt")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers)
