# 已验证本地样例与可复用机制

这些路径是本机参考，不是可移植依赖；文件不存在时先报告缺口，不编造已复用。先读源码和QA，实际检查对应成片关键帧。不要直接执行旧文件里的发布操作。

## 下班键：幽默与连续几何变化
- 源码：~/Documents/图文/outputs/news-card-pilot/off-work-key-01/src/off-work.tsx
- 成片：~/Documents/图文/outputs/news-card-pilot/off-work-key-01/videos/benxiang-off-work.mp4
- 联系表：~/Documents/图文/outputs/news-card-pilot/off-work-key-01/frames/contact-sheet.png
- 方法：useCurrentFrame驱动；矩形与纸飞机顶点插值；面片和UI透明度相接；错峰飞出；同一造型折返展开。
- 可复用：一眼能懂的开关动作、连续变形、错峰运动、短暂放松后收尾。
- 仅本条：下班键、待办、纸飞机、“还有一件事”。不要下一条仍复制同一笑点。
- 它是风格化SVG几何变形，不是物理正确的折纸模拟。

## 撤回消息：空间揭示与情绪
- 8秒源码：~/Documents/图文/outputs/news-card-pilot/unsent-universe-01/src/unsent.tsx
- 8秒成片：~/Documents/图文/outputs/news-card-pilot/unsent-universe-01/videos/benxiang-unsent.mp4
- 10秒源码：~/Documents/图文/outputs/news-card-pilot/unsent-universe-10s-01/src/unsent-ten.tsx
- 10秒成片：~/Documents/图文/outputs/news-card-pilot/unsent-universe-10s-01/videos/benxiang-unsent-10s.mp4
- 联系表：~/Documents/图文/outputs/news-card-pilot/unsent-universe-10s-01/frames/contact-sheet.png
- 方法：E/L插值；同一句话气泡压折变纸条；镜头围绕进入点缩放；纸条到星空前后层，再回到中央；标题与场景分层。剪裁边界仍须检查，不能把旧片当完美模板。
- 10秒分段时间映射：实际秒0/1.5/3.5/7/10映射到原时间0/1.15/3.7/6/8；分段速度不同。复用方法而非盲抄断点，新题材按读字和动作调整，检查速度接缝。
- 音轨重新合成至10秒并重对齐提示音，不靠静音填充。
- 可复用：进入点、同物体变形、空间分层与主角回收；终点产品或结果应由这次变化自然揭示，不能普通弹入一张新卡代替。
- 仅本条：撤回消息、纸条星空、“其实，我想你了”“撤回了，但没放下”。不将本象固定为情感号。

## 闪卡：连续运动观感参考
- 源码：~/Documents/图文/outputs/news-card-pilot/watchable-demo-02/src/holo.tsx
- 成片：~/Documents/图文/outputs/news-card-pilot/watchable-demo-02/videos/benxiang-holo-card.mp4
- 保留同一素材转为有空间感作品的直观变化、反光和正反面运动；用户喜欢制作观感，不代表已验证陌生观众关注或定制需求。
- 不把旧闪卡交互网页能力算作新视频已经实现的功能；不从该样例推导用户要做头像定制生意。

