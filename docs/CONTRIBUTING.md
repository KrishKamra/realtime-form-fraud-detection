# 🤝 Contributing to SentryForm

Thank you for your interest in contributing to **SentryForm**! We welcome contributions from developers, machine learning engineers, and cloud architects of all skill levels. 

By participating in this project, you agree to abide by our Code of Conduct and follow the guidelines outlined below.

---

## 🧰 Getting Started

### Prerequisites

Before contributing, make sure your local development machine has the following tools installed:

* **Node.js**: v20.x or higher
* **pnpm**: v8.x or higher (`corepack enable pnpm`)
* **Python**: v3.11
* **uv**: Fast Python package installer (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
* **Docker Desktop**: With Buildx support enabled

---

## 💻 Local Workspace Setup

SentryForm is structured as a monorepo containing the Next.js web client (`apps/web`), the FastAPI risk engine (`apps/api`), and infrastructure manifests (`deployment/`).

### 1. Clone the Repository
```bash
git clone [https://github.com/KrishKamra/sentry-form.git](https://github.com/KrishKamra/sentry-form.git)
cd sentry-form

```

### 2. Install Workspace Dependencies

```bash
# Install root & web dependencies
pnpm install

# Setup FastAPI Python virtual environment
cd apps/api
uv venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
cd ../..

```

### 3. Run Development Servers

**Option A: Local Development (Hot-Reloading)**

```bash
# Terminal 1: Launch FastAPI Backend Engine
cd apps/api
uvicorn src.main:app --reload --port 8000

# Terminal 2: Launch Next.js Web Application
pnpm --filter web dev

```

**Option B: Full Docker Stack**

```bash
docker compose -f deployment/docker-compose.yml up --build

```

---

## 🌿 Branching Strategy & Workflow

We follow a structured Git Workflow:

1. **Fork & Clone** the repository.
2. Create a feature branch off `main`:
```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix

```


3. Keep your branch small, atomic, and focused on a single change.

---

## 📝 Commit Message Conventions

We enforce [Conventional Commits](https://www.conventionalcommits.org/) to maintain clean repository history and enable automated semver releases.

Commit messages must follow this structure:

```text
<type>(<scope>): <short description>

```

### Supported Types:

* `feat`: A new feature or machine learning model improvement.
* `fix`: A bug fix in API endpoints, feature extraction, or UI components.
* `docs`: Documentation changes (`README.md`, `ARCHITECTURE.md`, inline code comments).
* `style`: Formatting changes that do not affect code logic (Prettier, Ruff).
* `refactor`: Code restructures that neither fix bugs nor add features.
* `perf`: Performance optimizations (e.g., ONNX model latency, Polars vectorization).
* `ci`: GitHub Actions pipeline updates or Docker configurations.

### Examples:

```bash
git commit -m "feat(api): add mouse trajectory curvature extraction using Polars"
git commit -m "fix(web): resolve WebSocket reconnect loop during network latency spike"
git commit -m "ci(docker): optimize multi-stage Dockerfile layer caching"

```

---

## 🧪 Code Quality & Testing Guidelines

Before submitting a pull request, ensure your code passes all type checks, linting rules, and unit tests:

### Python Engine (`apps/api`)

```bash
cd apps/api
# Run pytest test suite
pytest

# Code formatting & linting with Ruff
ruff check .
ruff format . --check

```

### Next.js Web Frontend (`apps/web`)

```bash
# TypeScript typechecking across workspace
pnpm --filter web typecheck

# ESLint inspection
pnpm --filter web lint

```

---

## 📥 Submitting a Pull Request (PR)

1. **Push your branch** to your fork:
```bash
git push origin feat/your-feature-name

```


2. **Open a PR** against the `main` branch of the primary repository.
3. **Fill out the PR Template**: Ensure all items in `.github/PULL_REQUEST_TEMPLATE.md` are completed.
4. **Link Related Issues**: Use keywords like `Fixes #12` or `Closes #34` in your PR description.
5. **CI Inspections**: Ensure all GitHub Actions status checks (unit tests, Docker builds, type checks) pass green.

---

## 💬 Need Help?

If you have questions, encounter a bug, or want to discuss a major architectural change:

* Open a [GitHub Discussion](https://www.google.com/search?q=https://github.com/KrishKamra/sentry-form/discussions) for Q&A and ideas.
* File a structured issue using our [Issue Templates](https://www.google.com/search?q=https://github.com/KrishKamra/sentry-form/issues/new/choose).

Thank you for helping build a safer, intelligent web with SentryForm! 🛡️