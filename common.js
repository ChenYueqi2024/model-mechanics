const Course = (() => {
  const lessons = [
    ['patch', 'Patch Lens'], ['attention', 'Attention'], ['bpe', 'BPE 分词'],
    ['rl', 'Q-learning'], ['gradient', '反向传播'], ['convolution', '卷积与边缘']
  ];
  const id = name => document.getElementById(name);
  const link = (href, text) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    return a;
  };
  function mount(current) {
    const nav = id('course-nav');
    nav.append(link('../index.html', 'Model Mechanics'));
    const group = document.createElement('div');
    lessons.forEach(([path, name]) => {
      const a = link('../' + path + '/index.html', name);
      if (path === current) a.setAttribute('aria-current', 'page');
      group.append(a);
    });
    nav.append(group);
  }
  return { id, mount };
})();
