// import { readFile } from 'node:fs/promises'

import { PostModel } from '../../models/post/post-models';
import { PostRepository } from './post-repository';
import path from 'path';
import { readFile } from 'fs/promises';

const ROOT_DIR = process.cwd();
const JSON_FILE_PATH = path.resolve(ROOT_DIR, 'src', 'db', 'seed', 'post.json');

const SIMULATE_WAIT_IN_MS = 0;

export class JsonPostRepository implements PostRepository {
  private async simulateAwait() {
    if (SIMULATE_WAIT_IN_MS >= 0) {
      await new Promise((resolve) => setTimeout(resolve, SIMULATE_WAIT_IN_MS));
    }
  }
  private async readFromDisk(): Promise<PostModel[]> {
    const jsonContent = await readFile(JSON_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(jsonContent);

    return parsed.posts;
  }
  async findAll(): Promise<PostModel[]> {
    await this.simulateAwait();
    const posts = await this.readFromDisk();
    return posts;
  }

  async findById(id: string): Promise<PostModel | null> {
    await this.simulateAwait();
    const posts = await this.findAll();
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new Error(`Post with id ${id} not found`);
    }

    return post || null;
  }

  async create(post: PostModel): Promise<PostModel> {
    return post;
  }

  async update(post: PostModel): Promise<PostModel> {
    return post;
  }

  async delete(id: string): Promise<void> {
    void id;
  }
}

export const postRepository: PostRepository = new JsonPostRepository();

// (async () => {
//   // const posts = await postRepository.findAll();
//   // posts.forEach((post) => {
//   //   console.log(post.author);
//   // });
//   const post = await postRepository.findById(
//     '99f8add4-7684-4c16-a316-616271db199e ',
//   );
//   console.log(post);
// })();
