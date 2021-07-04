import bcrypt from 'bcrypt';

class Encryptable {
    protected encrypt(str: string): string {
        return bcrypt.hashSync(str, 10);
    }
    
    protected validate(pass: string, hash: string): boolean {
        return bcrypt.compareSync(pass, hash)
    }
}

export default Encryptable;