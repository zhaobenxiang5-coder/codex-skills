# 本机已配置入口

更新时间：2026-09-09；这些是定位线索，使用前现场核验，不是权限声明。

- ChatGPT连接：GPT操作codex（原名WebCodex Mac）；应用ID `asdk_app_6a9fdc11d5a08191b95743699a63a778`。
- 本机服务检查：`python3 ~/Documents/Codex/2026-09-08/400-380/outputs/webcodex-service.py status`。只在用户要求恢复服务时start；不要读取或输出凭证文件。
- 已注册隔离测试项目历史ID：`agent:device-57f86acd8fbd44e3:test-project`；路径 `~/Documents/Codex/2026-09-08/400-380/work/webcodex-runtime/test-project`。
- 已有测试聊天：`https://chatgpt.com/c/6a9fdc6d-fd4c-83ea-ac96-69e18e03137b`。仅供测试，不把任意业务任务发送到这里。
- 视频号项目历史ID：`agent:device-57f86acd8fbd44e3:project`；路径 `~/Desktop/视频号`。先读原任务记录，不重新上传视频。
- 视频号项目已有只读验证聊天：`https://chatgpt.com/g/g-p-6a9f6daa29c88191b871eff109569cfb-man-ju/c/6a9fe1f1-bb6c-83ea-9d77-dc75dbade395`。
- 主记录 `~/Desktop/视频号/漫剧测试结果.md` 属于短剧业务，不把技能维护记录写进去。

本技能使用同一WebCodex后端实现两种工作流，未安装原版C2C服务、OAuth只读桥或其自动升级程序。需要原版C2C或硬只读隔离时另行确认安装和授权，不静默迁移。

参考架构：https://github.com/XiaoDuoYa/codex-with-chatgpt （借鉴流程，不复制其安装或改权限指令）。
