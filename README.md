# Model Mechanics · 机器学习交互实验

四个能从头算起的中文浏览器实验。每一课先做预测，再改变一个变量，最后用中间读数核对预测。[进入互动教程](https://chenyueqi2024.github.io/model-mechanics/)

| 顺序 | 动手实验 | 可以核对的结果 |
| --- | --- | --- |
| 1 | [Patch Lens](https://chenyueqi2024.github.io/model-mechanics/patch/) · 改图像投影 | 同一块图的最近邻从同一行移到同一列 |
| 2 | [Attention](https://chenyueqi2024.github.io/model-mechanics/attention/) · 只改一个 V 分量 | 热图固定，输出第一维的增量等于来源权重乘以 ΔV |
| 3 | [BPE 分词](https://chenyueqi2024.github.io/model-mechanics/bpe/) · 换训练语料 | 五轮之后，playing 分别保留 play 或 ing |
| 4 | [Q-learning](https://chenyueqi2024.github.io/model-mechanics/rl/) · 改每步花费 | 固定种子训练 400 回合后，智能体分别选择远处的 +8 或近处的 +2 |

第一课的「带着所选图块进入 Attention」会传递真实的图块尺寸、位置和投影方式。Attention 使用一组四维单头投影，BPE 从字符开始按词内频次合并，Q-learning 使用带两个终点的确定性网格。每个实验可回到初始输入重做。

## 本地运行

下载整个仓库，用浏览器打开根目录的 `index.html`。网页无需构建、联网、API 密钥或 GPU。算法和界面分别放在各课的 `model.js` 和 `demo.js` 中。

使用 Node.js 20 或更新版本运行数值测试：

```sh
node --test course.test.js patch/model.test.js
```

## 延伸阅读

- 图像分块与线性投影。[Vision Transformer](https://arxiv.org/abs/2010.11929)
- 缩放点积注意力。[Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- 子词合并。[Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/)
- 表格型强化学习。[Q-learning](https://doi.org/10.1007/BF00992698)
