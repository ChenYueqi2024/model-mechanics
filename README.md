# Model Mechanics · 机器学习交互实验

从语言 token 开始，沿着 Transformer、图像 patch 和 ViT，再进入训练、路由、图结构和决策。十九个实验可独立打开。[语言入口](https://chenyueqi2024.github.io/model-mechanics/bpe/) · [视觉入口](https://chenyueqi2024.github.io/model-mechanics/patch/)

## 从语言开始

从字符拼出 token，再观察可见上下文、采样概率与 Transformer 块。

- [BPE 分词](https://chenyueqi2024.github.io/model-mechanics/bpe/) · 从一个词或短句开始，逐轮学习合并规则，比较两种语料得到的切分。
- [因果掩码](https://chenyueqi2024.github.io/model-mechanics/causal/) · 沿用上一课的分词结果，篡改未来 token，检查当前位置的输出。
- [温度与采样](https://chenyueqi2024.github.io/model-mechanics/sampling/) · 沿用查询输出，固定随机数，比较温度和 top-p 怎样改变抽样频率。
- [Transformer 块](https://chenyueqi2024.github.io/model-mechanics/transformer/) · 沿着一个语言 token 核对注意力、残差连接和前馈层的贡献。

## 把 Transformer 用在图像上

将输入换成图块，追踪同一计算块怎样汇总图像；随后比较局部卷积和池化。

- [Patch Lens](https://chenyueqi2024.github.io/model-mechanics/patch/) · 在同一张图上切换颜色和纹理投影，寻找一个图块的最近邻。
- [Self-attention](https://chenyueqi2024.github.io/model-mechanics/attention/) · 沿用所选图块，只改一个 V 分量，核对它对输出的贡献。
- [二维位置编码](https://chenyueqi2024.github.io/model-mechanics/position/) · 同一个查询跟着图块移动，比较有无坐标时的注意力输出。
- [Vision Transformer](https://chenyueqi2024.github.io/model-mechanics/vit/) · 用语言课的同一个块处理图块，移除一个图块并比较整图读数。
- [卷积与边缘](https://chenyueqi2024.github.io/model-mechanics/convolution/) · 改从局部窗口读位置，逐格编辑像素、核对九次乘法。
- [池化与平移](https://chenyueqi2024.github.io/model-mechanics/pooling/) · 移动上一课的图像，比较最大池化与平均池化保留的局部信息。
- [图文检索](https://chenyueqi2024.github.io/model-mechanics/retrieval/) · 让四条描述竞争同一张图，错配训练标签，观察排名怎样改变。

## 模型怎样从数据学习

给样本加上标签，比较梯度、批量、样本难度顺序和新样本表现。

- [监督学习](https://chenyueqi2024.github.io/model-mechanics/supervised/) · 固定样本和训练预算，翻转一个标签，比较分类概率与交叉熵。
- [反向传播](https://chenyueqi2024.github.io/model-mechanics/gradient/) · 沿计算图追踪误差，比较三个学习率带来的训练轨迹。
- [小批量梯度](https://chenyueqi2024.github.io/model-mechanics/minibatch/) · 从上一课的权重起步，改变批量和顺序，比较每次更新与整组损失。
- [课程学习](https://chenyueqi2024.github.io/model-mechanics/curriculum/) · 在相同样本数下比较先易、先难和交错三种训练顺序。
- [泛化与过拟合](https://chenyueqi2024.github.io/model-mechanics/generalization/) · 改变邻居数，核对一张错标签怎样影响训练成绩和留出成绩。

## 扩展 · 路由、图与决策

改变专家的选择、图上的连接或行动的奖励，分别观察计算怎样改变。

- [稀疏 MoE](https://chenyueqi2024.github.io/model-mechanics/moe/) · 调节路由偏置和 top-k，观察门权重、专家输出与负载。
- [图神经网络](https://chenyueqi2024.github.io/model-mechanics/gnn/) · 逐层传播信号，加入一条捷径并检验邻居的贡献。
- [强化学习专题](https://chenyueqi2024.github.io/model-mechanics/rl/) · 对照两种老虎机策略，逐步回放 Q-learning，再试着让代理奖励和真实目标产生偏差。

## 跨课实验

BPE 的切分结果可以一路传给掩码、采样和 Transformer。语言课与 ViT 共用同一个 Transformer 块，视觉课之间传递图块、位置和像素。图文检索保留了把预测描述送回 BPE 的支线。监督学习和课程学习共用一份数据与分类器，便于控制变量。

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
