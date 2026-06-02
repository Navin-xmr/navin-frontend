import PaginationExample from '@components/common/Pagination/Pagination.example';

function PaginationDemo() {
  return (
    <main className="min-h-screen bg-background p-8 text-text-primary">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Pagination Component Demo</h1>
        <p className="text-text-secondary mb-8">
          Use this page to validate pagination behavior, disabled states, and ellipsis rendering.
        </p>

        <PaginationExample />
      </div>
    </main>
  );
}

export default PaginationDemo;
