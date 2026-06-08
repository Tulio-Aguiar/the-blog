import { PostRepository } from './post-repository';
import { JsonPostRepository } from './json-post-repository';

export const postRepository: PostRepository = new JsonPostRepository();
