const Course = (() => {
  const sections = [
    ['计算机视觉', [['patch', 'Patch Lens'], ['attention', 'Self-attention'], ['position', '二维位置编码'], ['convolution', '卷积与边缘'], ['pooling', '池化与平移']]],
    ['从图像走到语言', [['retrieval', '图文检索'], ['bpe', 'BPE 分词'], ['causal', '因果掩码'], ['sampling', '温度与采样']]],
    ['模型怎样学习', [['gradient', '反向传播'], ['minibatch', '小批量梯度'], ['generalization', '泛化与过拟合']]],
    ['选修 · 强化学习', [['rl', 'Q-learning']]]
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
