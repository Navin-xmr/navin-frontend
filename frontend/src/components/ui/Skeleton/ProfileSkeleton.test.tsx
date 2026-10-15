import { render } from '@testing-library/react';
import ProfileSkeleton from './ProfileSkeleton';

describe('ProfileSkeleton', () => {
  it('renders a single profile skeleton by default', () => {
    const { container } = render(<ProfileSkeleton />);

    const skeletons = container.querySelectorAll('[data-testid="profile-skeleton"]');
    expect(skeletons).toHaveLength(1);
  });

  it('renders multiple profile skeletons when count is provided', () => {
    const { container } = render(<ProfileSkeleton count={3} />);

    const skeletons = container.querySelectorAll('[data-testid="profile-skeleton"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders the expected structure with an avatar and two lines', () => {
    const { container } = render(<ProfileSkeleton />);

    const skeleton = container.querySelector('[data-testid="profile-skeleton"]');
    expect(skeleton).not.toBeNull();

    const avatar = skeleton?.querySelector('[data-testid="profile-skeleton-avatar"]');
    expect(avatar).not.toBeNull();

    const lines = skeleton?.querySelectorAll('[data-testid="profile-skeleton-line"]');
    expect(lines).toHaveLength(2);
  });
});