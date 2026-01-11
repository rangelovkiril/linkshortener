#!/bin/bash

# Deploy script за Link Shortener в Minikube
# Този script deploy-ва всички Kubernetes манифести в правилния ред

set -e  # Exit при грешка

echo "🚀 Starting Link Shortener deployment to Minikube..."

# Проверка дали Minikube работи
if ! minikube status &> /dev/null; then
    echo "❌ Minikube is not running. Starting Minikube..."
    minikube start --cpus=4 --memory=4096
fi

# Enable необходимите addons
echo "📦 Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# Изчакай ingress controller да стартира
echo "⏳ Waiting for ingress controller..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s || echo "Ingress controller might not be ready yet"

# Apply манифестите в правилния ред
echo ""
echo "📝 Creating namespace..."
kubectl apply -f 01-namespace.yaml

echo ""
echo "🔐 Creating secrets and configmaps..."
kubectl apply -f 02-secrets.yaml
kubectl apply -f 03-configmap.yaml

echo ""
echo "💾 Creating persistent volume claims..."
kubectl apply -f 04-postgres-pvc.yaml

echo ""
echo "🗄️  Deploying PostgreSQL..."
kubectl apply -f 05-postgres-deployment.yaml
kubectl apply -f 06-postgres-service.yaml

# Изчакай PostgreSQL да е ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --namespace linkshortener \
  --for=condition=ready pod \
  --selector=app=linkshortener-db \
  --timeout=120s

echo ""
echo "🔴 Deploying Redis..."
kubectl apply -f 07-redis-deployment.yaml
kubectl apply -f 08-redis-service.yaml

# Изчакай Redis да е ready
echo "⏳ Waiting for Redis to be ready..."
kubectl wait --namespace linkshortener \
  --for=condition=ready pod \
  --selector=app=linkshortener-redis \
  --timeout=60s

echo ""
echo "📊 Initializing database schema..."
kubectl apply -f 14-db-init-job.yaml

# Изчакай job да завърши
echo "⏳ Waiting for database initialization..."
kubectl wait --namespace linkshortener \
  --for=condition=complete \
  --timeout=120s \
  job/linkshortener-db-init

echo ""
echo "⚙️  Deploying backend..."
kubectl apply -f 09-backend-deployment.yaml
kubectl apply -f 10-backend-service.yaml

echo ""
echo "🎨 Deploying frontend..."
kubectl apply -f 11-frontend-deployment.yaml
kubectl apply -f 12-frontend-service.yaml

echo ""
echo "🌐 Creating ingress..."
kubectl apply -f 13-ingress.yaml

echo ""
echo "📈 Creating autoscalers..."
kubectl apply -f 15-hpa.yaml


# Покажи статус
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Cluster Status:"
kubectl get all -n linkshortener

# Получи URLs
echo ""
echo "🌐 Access URLs:"
MINIKUBE_IP=$(minikube ip)
echo "   Frontend: http://$MINIKUBE_IP:30000"
echo "   Backend API: http://$MINIKUBE_IP:30001"
echo ""
echo "   Or use ingress (add to /etc/hosts):"
echo "   $MINIKUBE_IP linkshortener.local"
echo "   Then access: http://linkshortener.local"

echo ""
echo "🔍 Useful commands:"
echo "   View logs: kubectl logs -n linkshortener -l app=linkshortener-backend"
echo "   Scale backend: kubectl scale -n linkshortener deployment/linkshortener-backend --replicas=3"
echo "   Port forward: kubectl port-forward -n linkshortener svc/linkshortener-backend 3000:3000"
echo "   Delete all: kubectl delete namespace linkshortener"

echo ""
echo "🎉 Link Shortener is now running!"