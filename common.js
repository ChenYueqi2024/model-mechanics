const Course = (() => {
  const sections = [
    ['语言模型基础', [['bpe', 'BPE 分词'], ['causal', '因果掩码'], ['sampling', '温度与采样'], ['transformer', 'Transformer 块']]],
    ['视觉与图文表征', [['patch', 'Patch Lens'], ['attention', 'Self-attention'], ['position', '二维位置编码'], ['vit', 'Vision Transformer'], ['convolution', '卷积与边缘'], ['pooling', '池化与平移'], ['retrieval', '图文检索']]],
    ['监督学习与泛化', [['supervised', '监督学习'], ['gradient', '反向传播'], ['minibatch', '小批量梯度'], ['curriculum', '课程学习'], ['generalization', '泛化与过拟合']]],
    ['分类评估与决策阈值', [['threshold', '分类阈值与代价']]],
    ['稀疏计算与专家路由', [['moe', '稀疏 MoE'], ['moe-capacity', '专家容量与负载'], ['sparse-attention', '稀疏注意力']]],
    ['图结构与消息传递', [['gnn', '图神经网络'], ['graph-aggregation', '邻居聚合与表达力'], ['graph-depth', '层数与过平滑']]],
    ['强化学习与序列决策', [['rl', '强化学习'], ['rl-value', '贝尔曼备份与价值迭代'], ['rl-offline', '离线强化学习与数据覆盖']]]
  ];
  const id = name => document.getElementById(name);
  function mount(current) {
    const nav = id('course-nav');
    const home = document.createElement('a');
    home.href = '../index.html';
    home.textContent = 'Model Mechanics';
    const label = document.createElement('label');
    label.className = 'course-jump';
    label.append('课程导航 ');
    const select = document.createElement('select');
    for (const [heading, lessons] of sections) {
      const group = document.createElement('optgroup');
      group.label = heading;
      for (const [path, name] of lessons) {
        const option = new Option(name,path);
        option.selected = path === current;
        group.append(option);
      }
      select.append(group);
    }
    select.value = current;
    select.onchange = () => { location.href = '../' + select.value + '/index.html'; };
    label.append(select);
    nav.append(home,label);
  }
  return { id, mount };
})();
