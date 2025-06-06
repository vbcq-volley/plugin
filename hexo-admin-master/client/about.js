class About {
  constructor() {
    this.element = null;
  }

  render() {
    if (this.element) {
      return this.element;
    }

    const div = document.createElement('div');
    div.className = 'about';

    const h1 = document.createElement('h1');
    h1.textContent = 'This is the Hexo Admin Enhanced Plugin';
    div.appendChild(h1);

    const p1 = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Goal: Provide an awesome admin experience for managing your blog.';
    p1.appendChild(strong);
    div.appendChild(p1);

    const p2 = document.createElement('p');
    p2.textContent = 'Useful links:';
    div.appendChild(p2);

    const ul = document.createElement('ul');
    
    const links = [
      { text: 'Hexo site', href: 'http://hexo.io' },
      { text: 'Github page for hexo admin plugin', href: 'https://github.com/jaredly/hexo-admin-plugin' },
      { text: 'Github page for this plugin', href: 'https://github.com/lwz7512/hexo-admin-ehc' }
    ];

    links.forEach(link => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      li.appendChild(a);
      ul.appendChild(li);
    });

    div.appendChild(ul);
    this.element = div;
    return this.element;
  }
}

module.exports = About;
