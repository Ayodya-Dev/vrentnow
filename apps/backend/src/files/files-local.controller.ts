import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Put,
  Req,
  Res,
  type RawBodyRequest,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { StorageService } from './storage.service';

/**
 * Stands in for S3 when FILES_DRIVER=local: the browser PUTs bytes to the URL
 * returned by presignPut, and GETs them back. Development only — there is no
 * signature to check, so the routes are open.
 *
 * Registered only when FILES_DRIVER=local (see files.module.ts), and hidden from
 * the OpenAPI contract so the generated client never offers it.
 */
@ApiExcludeController()
@Controller({ path: 'files/local', version: '1' })
export class FilesLocalController {
  constructor(
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {
    if (this.config.get<string>('FILES_DRIVER') === 's3') {
      throw new Error(
        'FilesLocalController must not be registered when FILES_DRIVER=s3',
      );
    }
  }

  @Put('*key')
  async upload(
    @Param('key') key: string | string[],
    @Req() req: RawBodyRequest<Request>,
    @Headers('content-type') contentType?: string,
  ): Promise<{ key: string }> {
    const objectKey = Array.isArray(key) ? key.join('/') : key;
    const body = await this.readBody(req);
    if (body.length === 0) {
      throw new BadRequestException('Empty upload body');
    }
    await this.storage.putObject(
      objectKey,
      body,
      contentType ?? 'application/octet-stream',
    );
    return { key: objectKey };
  }

  @Get('*key')
  async serve(
    @Param('key') key: string | string[],
    @Res() res: Response,
  ): Promise<void> {
    const objectKey = Array.isArray(key) ? key.join('/') : key;
    const head = await this.storage.headObject(objectKey);
    if (!head) throw new NotFoundException('Object not found');

    const bytes = await this.storage.getObject(objectKey);
    if (!bytes) throw new NotFoundException('Object not found');

    res.setHeader('Content-Type', head.contentType);
    res.setHeader('Content-Length', head.contentLength);
    res.send(bytes);
  }

  /** Browser PUTs image bytes — Nest's JSON body parser leaves @Body() empty. */
  private async readBody(req: RawBodyRequest<Request>): Promise<Buffer> {
    if (Buffer.isBuffer(req.rawBody) && req.rawBody.length > 0) {
      return req.rawBody;
    }
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      return req.body;
    }
    if (typeof req.body === 'string' && req.body.length > 0) {
      return Buffer.from(req.body);
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}
