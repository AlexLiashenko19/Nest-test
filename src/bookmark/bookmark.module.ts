import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmarker.service';

@Module({
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {}
