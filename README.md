# Model Mechanics · 机器学习交互实验

从一个图块开始，沿着注意力、卷积和图文检索走进语言模型，再动手验证学习与泛化。每课都可以单独打开。[进入互动教程](https://chenyueqi2024.github.io/model-mechanics/)

## 计算机视觉

沿着同一张图，从像素分块、全图注意力，走到空间坐标和局部边缘。

- [Patch Lens](https://chenyueqi2024.github.io/model-mechanics/patch/) · 在同一张图上切换颜色和纹理投影，寻找一个图块的最近邻。
- [Self-attention](https://chenyueqi2024.github.io/model-mechanics/attention/) · 沿用所选图块，只改一个 V 分量，核对它对输出的贡献。
- [二维位置编码](https://chenyueqi2024.github.io/model-mechanics/position/) · 同一个查询跟着图块移动，比较有无坐标时的注意力输出。
- [卷积与边缘](https://chenyueqi2024.github.io/model-mechanics/convolution/) · 改从局部窗口读位置，逐格编辑像素、核对九次乘法。
- [池化与平移](https://chenyueqi2024.github.io/model-mechanics/pooling/) · 移动上一课的图像，比较最大池化与平均池化保留的局部信息。

## 从图像走到语言

用上一课编辑的图寻找描述，把选中的那句话带进分词器，再看每个 token 能读到哪些信息。

- [图文检索](https://chenyueqi2024.github.io/model-mechanics/retrieval/) · 让四条描述竞争同一张图，错配训练标签，观察排名怎样改变。
- [BPE 分词](https://chenyueqi2024.github.io/model-mechanics/bpe/) · 保留选中的描述，逐步学习合并规则，比较不同语料学到的分词。
- [因果掩码](https://chenyueqi2024.github.io/model-mechanics/causal/) · 沿用上一课的分词结果，篡改未来 token，检查当前位置的输出。
- [温度与采样](https://chenyueqi2024.github.io/model-mechanics/sampling/) · 沿用查询输出，固定随机数，比较温度和 top-p 怎样改变抽样频率。

## 模型怎样学习

从一次权重更新走到整组样本，分别检验模型怎样降低误差、怎样应对新题。

- [反向传播](https://chenyueqi2024.github.io/model-mechanics/gradient/) · 沿计算图追踪误差，比较三个学习率带来的训练轨迹。
- [小批量梯度](https://chenyueqi2024.github.io/model-mechanics/minibatch/) · 从上一课的权重起步，改变批量和顺序，比较每次更新与整组损失。
- [泛化与过拟合](https://chenyueqi2024.github.io/model-mechanics/generalization/) · 改变邻居数，核对一张错标签怎样影响训练成绩和留出成绩。

## 选修 · 强化学习

把带标签的样本换成一次次行动，在迷宫里观察奖励怎样影响决策。

- [Q-learning](https://chenyueqi2024.github.io/model-mechanics/rl/) · 给每一步标一个价格，看智能体学会选择哪个终点。

## 贯穿课程的实验数据

Patch Lens 传递图块大小、投影方式和查询位置。Self-attention 把查询、来源和 V 的改变量传给位置实验。该实验从跟踪图块的中心取出 7 × 7 像素，按局部平均亮度二值化后送入卷积。卷积把编辑后的像素和核方向传给池化，池化把平移后的图像送入检索。检索页把所选描述送入 BPE，BPE 把文本、语料和已执行的合并轮数送入因果掩码课。该课的查询输出继续用于采样，反向传播的当前权重和学习率则带入小批量实验。所有计算均在浏览器内完成。

## 本地运行

下载整个仓库，用浏览器打开根目录的 `index.html`。网页无需构建、联网、API 密钥或 GPU。算法和界面分别放在各课的 `model.js` 和 `demo.js` 中。

使用 Node.js 20 或更新版本运行数值测试：

```sh
node --test
```

## 延伸阅读

- 图像分块与线性投影。[Vision Transformer](https://arxiv.org/abs/2010.11929)
- 缩放点积注意力。[Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- 子词合并。[Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/)
- 表格型强化学习。[Q-learning](https://doi.org/10.1007/BF00992698)
- 图文对比学习。[CLIP](https://proceedings.mlr.press/v139/radford21a.html)
