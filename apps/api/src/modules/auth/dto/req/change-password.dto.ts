import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'currentPassword123' })
    @IsNotEmpty()
    @IsString()
    public readonly currentPassword!: string;

    @ApiProperty({ example: 'newPassword123' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    public readonly newPassword!: string;
}
