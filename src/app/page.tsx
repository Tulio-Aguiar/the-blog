import { Container } from '@/components/Container';
import PostsList from '@/components/PostsList';
import SpinLoader from '@/components/SpinLoader';
import { Suspense } from 'react';
import Header from '../components/Header';

export default async function HomePage() {
  return (
    <div className="bg-background text-text-primary min-h-screen">
      <Container>
        <Header />

        <Suspense fallback={<SpinLoader />}>
          <PostsList />
        </Suspense>

        <footer>
          <p className="py-8 text-center text-6xl font-bold">Footer</p>
        </footer>
      </Container>
    </div>
  );
}
