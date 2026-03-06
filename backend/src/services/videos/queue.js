export class Queue {
    constructor(worker) {
        this.queue = [];
        this.worker = worker;
        this.running = false;
    }
    enqueue(data) {
        this.queue.push({ data });
        this.queue.sort((a, b) => a.data.size - b.data.size); // Min priority = highest importance
        if (!this.running) {
            this.run();
        }
    }

    async run(){
        this.running = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            await this.worker(job.data);
        }
        this.running = false;
    }
    isEmpty() {
        return this.queue.length === 0;
    }
}