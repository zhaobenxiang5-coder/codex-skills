#!/usr/bin/env bash
# ==============================================================================
# Agent Skills Collection 一键安装与同步脚本
# 支持目标平台: OpenAI Codex, Claude Code, Google Antigravity
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/skills"

CODEX_DIR="$HOME/.codex/skills"
CLAUDE_DIR="$HOME/.claude/skills"
ANTIGRAVITY_DIR="$HOME/.gemini/config/skills"

USE_COPY=false
TARGET=""

print_help() {
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -t, --target <平台>   目标平台: codex | claude | antigravity | all"
    echo "  -c, --copy           使用物理拷贝而非软链接（默认使用软链接）"
    echo "  -h, --help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --target codex              # 软链接所有技能到 ~/.codex/skills"
    echo "  $0 --target claude --copy      # 拷贝所有技能到 ~/.claude/skills"
    echo "  $0 --target all                # 一键链接到所有已安装的 Agent 工具"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -t|--target)
            TARGET="$2"
            shift 2
            ;;
        -c|--copy)
            USE_COPY=true
            shift
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        *)
            echo "未知参数: $1"
            print_help
            exit 1
            ;;
    esac
done

if [ -z "$TARGET" ]; then
    echo "========================================================"
    echo "   Agent Skills 技能库一键安装程序"
    echo "========================================================"
    echo "请选择要安装到的目标 Agent:"
    echo "  1) OpenAI Codex (~/.codex/skills)"
    echo "  2) Claude Code (~/.claude/skills)"
    echo "  3) Google Antigravity (~/.gemini/config/skills)"
    echo "  4) 全部安装 (All)"
    echo "  q) 退出"
    read -p "请输入选项 [1-4]: " choice
    case "$choice" in
        1) TARGET="codex" ;;
        2) TARGET="claude" ;;
        3) TARGET="antigravity" ;;
        4) TARGET="all" ;;
        *) echo "已取消"; exit 0 ;;
    esac
fi

install_to() {
    local dest_dir="$1"
    local name="$2"
    
    echo ""
    echo "==> 正在部署技能到 $name: $dest_dir ..."
    mkdir -p "$dest_dir"
    
    local count=0
    for skill_path in "$SKILLS_SRC"/*; do
        if [ -d "$skill_path" ]; then
            local skill_name="$(basename "$skill_path")"
            local target_path="$dest_dir/$skill_name"
            
            if [ "$USE_COPY" = true ]; then
                rm -rf "$target_path"
                cp -R "$skill_path" "$target_path"
            else
                ln -sfn "$skill_path" "$target_path"
            fi
            count=$((count + 1))
        fi
    done
    echo "✅ 成功为 $name 部署了 $count 个技能！"
}

case "$TARGET" in
    codex)
        install_to "$CODEX_DIR" "OpenAI Codex"
        ;;
    claude)
        install_to "$CLAUDE_DIR" "Claude Code"
        ;;
    antigravity)
        install_to "$ANTIGRAVITY_DIR" "Google Antigravity"
        ;;
    all)
        install_to "$CODEX_DIR" "OpenAI Codex"
        install_to "$CLAUDE_DIR" "Claude Code"
        install_to "$ANTIGRAVITY_DIR" "Google Antigravity"
        ;;
    *)
        echo "错误: 未知目标平台 '$TARGET'"
        exit 1
        ;;
esac

echo ""
echo "🎉 所有技能配置完毕！立即在您的 Agent 中调用吧。"
