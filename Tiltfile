# Tiltfile for KnowBot RAG
print("Parsing KnowBot Tiltfile...")

# 1. Start Docker Compose
docker_compose('docker-compose.yml')

# 2. Configure Service Resources in Tilt Dashboard
# Backend
dc_resource('backend', 
    links=['http://localhost:8000/api/health/'],
    labels=['App-Server']
)

# Frontend
dc_resource('frontend',
    links=['http://localhost:3000'],
    labels=['App-Server']
)

# Celery
dc_resource('celery',
    labels=['App-Server']
)

# Infrastructure
dc_resource('db', labels=['Infrastructure'])
dc_resource('redis', labels=['Infrastructure'])
dc_resource('ollama', labels=['Infrastructure'])

print("Tiltfile parsed successfully!")
