import { MagicLink } from '../entities/magic-link.entity';

export interface IMagicLinkRepository {
  create(magicLink: MagicLink): Promise<MagicLink>;
  findByToken(token: string): Promise<MagicLink | null>;
  markAsUsed(id: string): Promise<void>;
  invalidatePreviousLinks(userId: string): Promise<void>;
}

export const MAGIC_LINK_REPOSITORY = Symbol('IMagicLinkRepository');
