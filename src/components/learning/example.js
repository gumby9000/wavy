//Example of vanilla js vs react

//can declare and initialize member variables inside of constructor
//dont need function keyword
class Counter {
    constructor(containerId) {
        this.count = 0;
        this.container = document.getElementById(containerId);
        this.render();
    }

    increment() {
        this.count++;
        this.render();  // Must manually call render
    }

    render() {
        this.container.innerHTML = `Count: ${this.count}`;
    }
}

// React Component
function Counter() {
    const [count, setCount] = useState(0);
    // React handles rendering automatically
    return <div>Count: {count}</div>;
}