import type { ProductTag } from '../../data/types';
import { Badge } from '../ui/Badge';

const LABEL: Record<ProductTag, string> = {
  sale: 'Sale',
  new: 'New',
  bestseller: 'Bestseller',
  rebate: 'Rebate eligible',
};

const TONE = { sale: 'sale', new: 'new', bestseller: 'accent', rebate: 'rebate' } as const;

export function TagBadges({ tags, max = 2 }: { tags: ProductTag[]; max?: number }) {
  return (
    <>
      {tags.slice(0, max).map((t) => (
        <Badge key={t} tone={TONE[t]}>
          {LABEL[t]}
        </Badge>
      ))}
    </>
  );
}
