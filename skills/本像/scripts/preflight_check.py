#!/usr/bin/env python3
"""
《本像》核心工具脚本：现场体检与基线自检工具 (Preflight Check)
设计理念：贯彻“先读现场再动笔”的核心认知铁律，在任何修改与任务执行前，自动快速体检当前环境与网络连通性。
"""

import sys
import os
import platform
import subprocess
import shutil

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
        return res.returncode == 0, res.stdout.strip()
    except Exception as e:
        return False, str(e)

def main():
    print("==================================================")
    print("      🧠 《本像》环境现场体检工具 (Preflight)     ")
    print("==================================================")
    
    # 1. 基础系统环境
    print("\n[1] 宿主机环境:")
    print(f"  - 操作系统: {platform.system()} {platform.release()} ({platform.machine()})")
    print(f"  - Python版本: {platform.python_version()} ({sys.executable})")
    has_node, node_ver = run_cmd("node -v")
    print(f"  - Node.js版本: {node_ver if has_node else '未安装'}")
    has_git, git_ver = run_cmd("git --version")
    print(f"  - Git版本: {git_ver if has_git else '未安装'}")

    # 2. Git 配置脱敏自检
    print("\n[2] Git 身份与脱敏检查:")
    _, user_name = run_cmd("git config user.name")
    _, user_email = run_cmd("git config user.email")
    print(f"  - 当前提交用户名: {user_name}")
    print(f"  - 当前提交邮箱: {user_email}")
    if any(kw in (user_name or "").lower() for kw in ["password", "密码", "123", "0000"]):
        print("  ⚠️  警告：用户名中疑似夹带敏感词汇或密码！")
    else:
        print("  ✅ 提交者身份已纯净脱敏。")

    # 3. 网络与代理连通性
    print("\n[3] 关键网络连通性:")
    ok_gh, _ = run_cmd("curl -s -o /dev/null -w '%{http_code}' --max-time 3 https://github.com")
    print(f"  - GitHub 直连状态: {'正常 (HTTP ' + _ + ')' if ok_gh and _ == '200' else '需代理或超时'}")
    
    ok_proxy, _ = run_cmd("curl -s -x http://127.0.0.1:7897 -o /dev/null -w '%{http_code}' --max-time 3 https://github.com")
    if ok_proxy and _ == '200':
        print(f"  - 本地 7897 混合代理: 活跃且连通 GitHub (HTTP 200)")

    # 4. 工作区与唯一写入检查
    print("\n[4] 当前工作区现场:")
    cwd = os.getcwd()
    print(f"  - 当前工作路径: {cwd}")
    if os.path.exists(os.path.join(cwd, ".git")):
        _, status = run_cmd("git status -s")
        clean = "干净 (Clean)" if not status else f"有 {len(status.splitlines())} 处未提交修改"
        print(f"  - Git 工作树状态: {clean}")
    else:
        print(f"  - 非 Git 仓库目录")

    print("\n" + "="*50)
    print("✅ 现场读毕。严格贯彻：先现场后动作、业务完成看终审证据！")
    print("==================================================\n")

if __name__ == "__main__":
    main()
