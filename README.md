# Chat API

Aplikacja czatu wykorzystująca OpenAI API do generowania odpowiedzi.

## Wymagania

- Docker
- Docker Compose
- Klucz API OpenAI

## Instalacja i uruchomienie

1. Sklonuj repozytorium:
```bash
git clone [url-repozytorium]
cd chatAPI
```

2. Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

3. Skonfiguruj plik `.env`:
   - Dodaj swój klucz API OpenAI w zmiennej `OPENAI_API_KEY`
   - W razie potrzeby dostosuj pozostałe zmienne środowiskowe

4. Uruchom aplikację za pomocą Docker Compose:
```bash
docker-compose up --build
```

Po uruchomieniu:
- Frontend będzie dostępny pod adresem: `http://localhost:3000`
- Backend będzie dostępny pod adresem: `http://localhost:4000`
- Baza danych PostgreSQL będzie działać na porcie `5432`

## Struktura projektu

- `frontend/` - aplikacja frontendowa (Vue.js)
- `backend/` - serwer backendowy (Node.js/Express)
- `docker-compose.yml` - konfiguracja kontenerów Docker
- `.env` - zmienne środowiskowe

## Ważne

Przed uruchomieniem aplikacji upewnij się, że:
1. Masz zainstalowanego Dockera i Docker Compose
2. Posiadasz aktywny klucz API OpenAI
3. Porty 3000, 4000 i 5432 są wolne na Twoim systemie 