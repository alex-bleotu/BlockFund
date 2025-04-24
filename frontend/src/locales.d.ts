declare module "*.po" {
    const content: { messages: { [key: string]: string } };
    export = content;
}
