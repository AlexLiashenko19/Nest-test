import { createBookmarkDto, editBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable({})
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarksById(userId: number, bookmarkId: number) {}

  async createBookmarksById(userId: number, dto: createBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  editBookmarksById(userId: number, bookmarkId: number, dto: editBookmarkDto) {}

  deleteBookmarksById(userId: number, bookmarkId: number) {}
}
