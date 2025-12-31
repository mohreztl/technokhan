.PHONY: help build up down restart logs clean dev prod backup restore

# Colors for output
BLUE=\033[0;34m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)AutoLounge Docker Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build

up: ## Start all services in detached mode
	@echo "$(BLUE)Starting services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "Web: http://localhost:3000"
	@echo "API: http://localhost:5000"

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	docker-compose down
	@echo "$(GREEN)Services stopped!$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)Services restarted!$(NC)"

logs: ## Show logs for all services
	docker-compose logs -f

logs-api: ## Show API logs
	docker-compose logs -f api

logs-web: ## Show Web logs
	docker-compose logs -f web

logs-db: ## Show database logs
	docker-compose logs -f postgres

ps: ## Show running containers
	docker-compose ps

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)Warning: This will remove all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker rmi autolounge-api autolounge-web 2>/dev/null || true; \
		echo "$(GREEN)Cleaned up!$(NC)"; \
	fi

dev: ## Start development environment with database only
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development database started!$(NC)"
	@echo "PostgreSQL: localhost:5432"

dev-full: ## Start development environment with all tools
	@echo "$(BLUE)Starting full development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml --profile with-admin --profile with-redis up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "PostgreSQL: localhost:5432"
	@echo "Adminer: http://localhost:8080"
	@echo "Redis: localhost:6379"

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

prod: ## Start production environment with Nginx
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker-compose --profile with-nginx up -d --build
	@echo "$(GREEN)Production environment started!$(NC)"
	@echo "Application: http://localhost"

rebuild: ## Rebuild and restart all services
	@echo "$(BLUE)Rebuilding and restarting...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)Rebuild complete!$(NC)"

shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-web: ## Open shell in Web container
	docker-compose exec web sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U autolounge -d autolounge

prisma-generate: ## Generate Prisma Client
	docker-compose exec api pnpm prisma:generate

prisma-migrate: ## Run Prisma migrations
	docker-compose exec api pnpm prisma migrate deploy

prisma-studio: ## Open Prisma Studio
	docker-compose exec api pnpm prisma:studio

backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U autolounge autolounge > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup created in backups/$(NC)"

restore: ## Restore database from backup (usage: make restore FILE=backups/backup_file.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE=path/to/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	@docker-compose exec -T postgres psql -U autolounge autolounge < $(FILE)
	@echo "$(GREEN)Database restored!$(NC)"

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -s http://localhost:5000/health && echo "$(GREEN)API: Healthy$(NC)" || echo "$(RED)API: Unhealthy$(NC)"
	@curl -s http://localhost:3000/api/health && echo "$(GREEN)Web: Healthy$(NC)" || echo "$(RED)Web: Unhealthy$(NC)"

stats: ## Show container resource usage
	docker stats --no-stream

prune: ## Remove unused Docker resources
	@echo "$(BLUE)Removing unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"
