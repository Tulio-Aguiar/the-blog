import { postRepository } from '../../repositories/post';

export default async function PostsList() {
  const posts = await postRepository.findAll();
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => {
        return (
          <div key={post.id} className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-gray-500">{post.excerpt}</p>
          </div>
        );
      })}
    </div>
  );
}
