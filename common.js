const Course = (() => {
  const sections = [
    ['从语言开始', [['bpe', 'BPE 分词'], ['causal', '因果掩码'], ['sampling', '温度与采样'], ['transformer', 'Transformer 块']]],
    ['把 Transformer 用在图像上', [['patch', 'Patch Lens'], ['attention', 'Self-attention'], ['position', '二维位置编码'], ['vit', 'Vision Transformer'], ['convolution', '卷积与边缘'], ['pooling', '池化与平移'], ['retrieval', '图文检索']]],
    ['模型怎样从数据学习', [['supervised', '监督学习'], ['gradient', '反向传播'], ['minibatch', '小批量梯度'], ['curriculum', '课程学习'], ['generalization', '泛化与过拟合']]],
    ['扩展 · 路由、图与决策', [['moe', '稀疏 MoE'], ['gnn', '图神经网络'], ['rl', '强化学习']]]
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
