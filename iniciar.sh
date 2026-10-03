#!/usr/bin/env bash

echo "=========================================================="
echo "  ROVIRO COBRANÇA AUTOMATIZADA — SERVIDOR & CLIENTE"
echo "=========================================================="

cd "$(dirname "$0")"

# Encerra processos filhos ao sair com Ctrl+C
trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Iniciando backend em http://localhost:3001..."
cd server && bun run src/index.ts &

echo "Iniciando frontend em http://localhost:5173..."
cd ../client && bun run dev &

wait
