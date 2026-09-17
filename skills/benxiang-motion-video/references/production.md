# 本地制作与验收

## 复用运行环境
先确认项目AGENTS及既有Remotion依赖，不迁移技术栈。
本机已用运行目录：~/.cache/benxiang-remotion-4.0.489
检查其node_modules/.bin/remotion存在并读取package版本；缓存缺失时按现有项目锁定依赖恢复，不能声称路径永久可用，也不擅自全局升级。

本机输出根目录：~/Documents/图文/outputs/news-card-pilot/
新建独立题材目录，保存src、assets、videos、frames与简短QA；不覆盖既有目录。
将新源码复制到已核实运行目录编译，用显式public-dir指向新assets。每个任务记录实际命令，不造通用发布CLI。

## 规格
默认1080×1920、30fps，8秒240帧或10秒300帧；用户要求其他时长时按实际秒数计算。
H.264、limited-range yuv420p、AAC 48kHz、MP4 faststart。
FFprobe若读到yuvj420p/full-range，则用FFmpeg正确变换色域范围后再编码，不能只改标签；输入范围必须从实际读值确定，已经limited的文件不重复按full转换。
音乐为已确认可用素材或新作合成音，记录文件来源/哈希；代码自绘不意味着字体、外来图片也自动获商业许可。

## 验收分层
1. **静态视觉**：从实际MP4取首帧、变形开始、镜头交接、空间展开、最后可读帧，做联系表；360px宽检查标题主体，180px宽辅助检查主标题。看遮挡、切边、英文信息干扰、空场和反差是否可理解。
2. **动态**：播放实际片段/全片，检查同物体可追踪、推进连续、折叠与展开衔接、时序速度跳变。抽帧通过不等于播放验收通过；工具不能观测播放时写明未验证。
3. **声音**：实际试听点击/掠过/收尾是否对齐、是否刺耳或突断。音轨存在、峰值/静音检测通过都不能替代试听；未试听如实写。
4. **技术**：FFprobe独立回读时长、分辨率、帧率、编码、像素格式、音频采样率；FFmpeg完整解码、blackdetect和silencedetect。深色背景不等于黑帧，设计停顿不等于错误，结合实际帧解释结果。默认检测黑帧持续0.1秒、静音低于-45dB持续1秒作为待复核信号。
5. **保留历史**：对照原片SHA-256；新输出标明版本。保留实际执行命令与未执行项。

交付MP4、关键帧/联系表、QA与使用素材来源/许可。无需为了原创概念动画制造“新闻两事实”接口。若延用现有news-items.json则保持其合同，但不伪造新闻来源或验证结果。
不开展平台数据回收、登录、声明设置或发布；这些不属于本Skill。

## 骨架运行
复制assets/remotion-starter的全部三个文件到已核验Remotion运行目录下的独立子目录（如src/benxiang-starter）。保留相对导入。
测试：node ~/.codex/skills/benxiang-motion-video/scripts/test-motion.mjs
关键帧命令（在Remotion运行目录）：./node_modules/.bin/remotion still src/benxiang-starter/index.tsx MotionStarter <本次输出PNG绝对路径> --frame=135
视频命令：./node_modules/.bin/remotion render src/benxiang-starter/index.tsx MotionStarter <本次输出MP4绝对路径> --codec=h264 --crf=18 --concurrency=2
骨架自身无音轨，当前任务要求声音时再添加。函数测试通过不代表成片流畅、无穿模或已试听。
