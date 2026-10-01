import { Check as LucideCheck } from 'lucide-react'
import { IconCheck } from '@tabler/icons-react'
import { FaCheck } from 'react-icons/fa'
import { Check as PhosphorCheck } from '@phosphor-icons/react'
import { CheckIcon } from '@radix-ui/react-icons'
import { CheckIcon as HeroCheck } from '@heroicons/react/24/solid'
import { Icon } from '@iconify/react'

export const Icons = () => (
  <>
    <LucideCheck />
    <IconCheck />
    <FaCheck />
    <PhosphorCheck />
    <CheckIcon />
    <HeroCheck />
    <Icon icon="mdi:check" />
  </>
)
