import { Flower2, Package } from 'lucide-react'

export const configModules = {
  fertilizer: 'fertilizerConfiguration',
  items: 'itemConfiguration',
}

export const configMeta = {
  fertilizer: {
    label: 'Fertilizer',
    plural: 'Fertilizer Types',
    icon: Flower2,
    placeholder: 'e.g., Organic Compost',
  },
  items: {
    label: 'Item',
    plural: 'Item Types',
    icon: Package,
    placeholder: 'e.g., Leaf Collection Basket',
  },
}

export const themedAccent = {
  icon: {
    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
    color: 'var(--theme-primary)',
  },
  selected: {
    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
  },
  border: {
    borderColor: 'color-mix(in srgb, var(--theme-primary) 28%, var(--theme-border))',
  },
  button: {
    backgroundColor: 'var(--theme-primary)',
    color: 'var(--theme-white)',
  },
}
