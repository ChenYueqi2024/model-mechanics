# Model Mechanics · 机器学习交互实验

28 个浏览器交互实验，从语言和视觉表征走到监督训练、分类评估、稀疏计算、图结构与序列决策。[语言入口](https://chenyueqi2024.github.io/model-mechanics/bpe/) · [视觉入口](https://chenyueqi2024.github.io/model-mechanics/patch/) · [网络与信息安全专题](https://chenyueqi2024.github.io/explore/#security)

## 语言模型基础

从字符拼出 token，再观察可见上下文、采样概率与 Transformer 块。

- [BPE 分词](https://chenyueqi2024.github.io/model-mechanics/bpe/) · 从一个词或短句开始，逐轮学习合并规则，比较两种语料得到的切分。
- [因果掩码](https://chenyueqi2024.github.io/model-mechanics/causal/) · 沿用上一课的分词结果，篡改未来 token，检查当前位置的输出。
- [温度与采样](https://chenyueqi2024.github.io/model-mechanics/sampling/) · 沿用查询输出，固定随机数，比较温度和 top-p 怎样改变抽样频率。
- [Transformer 块](https://chenyueqi2024.github.io/model-mechanics/transformer/) · 沿着一个语言 token 核对注意力、残差连接和前馈层的贡献。

## 视觉与图文表征

把图像切成图块，比较注意力、卷积和池化怎样提取特征，最后用图文检索连接像素与描述。

- [Patch Lens](https://chenyueqi2024.github.io/model-mechanics/patch/) · [网络与信息安全专题](https://chenyueqi2024.github.io/explore/#security) · 在同一张图上切换颜色和纹理投影，寻找一个图块的最近邻。
- [Self-attention](https://chenyueqi2024.github.io/model-mechanics/attention/) · 沿用所选图块，只改一个 V 分量，核对它对输出的贡献。
- [二维位置编码](https://chenyueqi2024.github.io/model-mechanics/position/) · 同一个查询跟着图块移动，比较有无坐标时的注意力输出。
- [Vision Transformer](https://chenyueqi2024.github.io/model-mechanics/vit/) · 用语言课的同一个块处理图块，移除一个图块并比较整图读数。
- [卷积与边缘](https://chenyueqi2024.github.io/model-mechanics/convolution/) · 改从局部窗口读位置，逐格编辑像素、核对九次乘法。
- [池化与平移](https://chenyueqi2024.github.io/model-mechanics/pooling/) · 移动上一课的图像，比较最大池化与平均池化保留的局部信息。
- [图文检索](https://chenyueqi2024.github.io/model-mechanics/retrieval/) · 让四条描述竞争同一张图，错配训练标签，观察排名怎样改变。

## 监督学习与泛化

给样本加上标签，比较梯度、批量、样本难度顺序和新样本表现。

- [监督学习](https://chenyueqi2024.github.io/model-mechanics/supervised/) · 固定样本和训练预算，翻转一个标签，比较分类概率与交叉熵。
- [反向传播](https://chenyueqi2024.github.io/model-mechanics/gradient/) · 沿计算图追踪误差，比较三个学习率带来的训练轨迹。
- [小批量梯度](https://chenyueqi2024.github.io/model-mechanics/minibatch/) · 从上一课的权重起步，改变批量和顺序，比较每次更新与整组损失。
- [课程学习](https://chenyueqi2024.github.io/model-mechanics/curriculum/) · 在相同样本数下比较先易、先难和交错三种训练顺序。
- [泛化与过拟合](https://chenyueqi2024.github.io/model-mechanics/generalization/) · 改变邻居数，核对一张错标签怎样影响训练成绩和留出成绩。

## 分类评估与决策阈值

先挑一个操作阈值，再扫过整条 ROC／PR 曲线，最后在分组误差与复核预算之间做取舍。

- [分类阈值与代价](https://chenyueqi2024.github.io/model-mechanics/threshold/) · 拖动阈值，比较误报、漏报与精确率；再改变阳性基率，检查同一阈值的部署结果。

- [ROC、PR 与类别不平衡](https://chenyueqi2024.github.io/model-mechanics/classification-curves/) · 固定模型得分，扫描阈值并改变阳性基率，对照误报率、召回率和精确率。
- [分组误差与复核预算](https://chenyueqi2024.github.io/model-mechanics/review-budget/) · 比较统一与分组阈值，检查召回差距缩小后，待复核数量会不会超出预算。

## 稀疏计算与专家路由

从选择专家、分配容量到减少注意力连接，分别观察稀疏计算的收益与代价。

- [稀疏 MoE](https://chenyueqi2024.github.io/model-mechanics/moe/) · 调节路由偏置和 top-k，观察门权重、专家输出与负载。
- [专家容量与负载](https://chenyueqi2024.github.io/model-mechanics/moe-capacity/) · 把 token 挤向同一个专家，比较容量限制、改派与未处理量。
- [稀疏注意力](https://chenyueqi2024.github.io/model-mechanics/sparse-attention/) · 对比全连接、局部窗口和锚点，用多层可达性观察减少配对计算的代价。

## 图结构与消息传递

沿边传播消息，再看求和、平均、网络深度怎样改变节点能保留的信号。

- [图神经网络](https://chenyueqi2024.github.io/model-mechanics/gnn/) · 逐层传播信号，加入一条捷径并检验邻居的贡献。
- [邻居聚合与表达力](https://chenyueqi2024.github.io/model-mechanics/graph-aggregation/) · 交换、复制邻居特征，比较求和、平均和最大值各会丢掉什么。
- [层数与过平滑](https://chenyueqi2024.github.io/model-mechanics/graph-depth/) · 逐层混合相邻特征，测量两组节点间的差距，再对比保留初始特征。

## 强化学习与序列决策

从状态和回报开始，比较采样学习、已知模型下的规划与固定日志下的决策。

- [强化学习专题](https://chenyueqi2024.github.io/model-mechanics/rl/) · 手算折扣回报，对照两种多臂老虎机策略，逐步回放 Q-learning，再比较代理奖励和真实目标。
- [贝尔曼备份与价值迭代](https://chenyueqi2024.github.io/model-mechanics/rl-value/) · 修改远路成功概率，逐轮观察价值如何沿已知转移向前传播。
- [离线强化学习与数据覆盖](https://chenyueqi2024.github.io/model-mechanics/rl-offline/) · 比较无覆盖、采样不足和补充覆盖，观察历史估值怎样影响策略选择。

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
