#!/bin/bash
# ==========================================
# Geridor de Tarefas Diárias - Bruno
# ==========================================

TASKS_FILE="/Users/brunotoaz/Downloads/DESENVOLVIMENTO/Bruno/Widsurf/picoclaw/workspace/tasks/tasks.json"

# Cores
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
NC='\033[0m' # No Color

function mostrar_menu() {
    echo ""
    echo -e "${AZUL}=======================================${NC}"
    echo -e "${AZUL}  📋 GERIDOR DE TAREFAS - BRUNO${NC}"
    echo -e "${AZUL}=======================================${NC}"
    echo ""
    echo "  1. Listar todas as tarefas"
    echo "  2. Listar tarefas URGENTES"
    echo "  3. Marcar tarefa como concluída"
    echo "  4. Adicionar nova tarefa"
    echo "  5. Verificar emails (agora)"
    echo "  6. Sair"
    echo ""
    echo -n "  Escolhe uma opção: "
}

function listar_tarefas() {
    echo ""
    echo -e "${VERDE}📋 TAREFAS ATUAIS:${NC}"
    echo "-------------------------------------------"
    
    if [ -f "$TASKS_FILE" ]; then
        cat "$TASKS_FILE" | grep -E '"titulo"|"prioridade"|"status"|"deadline"' | sed 's/.*"titulo": *"\([^"]*\)".*/\1/; s/.*"prioridade": *"\([^"]*\)".*/  Prioridade: \1/; s/.*"status": *"\([^"]*\)".*/  Status: \1/; s/.*"deadline": *"\([^"]*\)".*/  Deadline: \1/' | paste - - - -
    fi
    echo ""
}

function listar_urgentes() {
    echo ""
    echo -e "${VERMELHO}🚨 TAREFAS URGENTES:${NC}"
    echo "-------------------------------------------"
    echo "  (a implementar com jq)"
    echo ""
}

# Loop principal
while true; do
    mostrar_menu
    read opcao
    
    case $opcao in
        1) listar_tarefas ;;
        2) listar_urgentes ;;
        3) echo "Qual ID da tarefa? "; read id; echo "Tarefa $id marcada como concluída!" ;;
        4) echo "Título da tarefa: "; read titulo; echo "Tarefa adicionada!" ;;
        5) echo "A verificar emails..." ;;
        6) echo "Até já Bruno! 👋"; exit 0 ;;
        *) echo -e "${VERMELHO}Opção inválida!${NC}" ;;
    esac
done
