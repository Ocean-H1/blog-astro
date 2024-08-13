/**
 * @Description: 文件相关
 * @Author: OceanH
 * @Date: 2024-08-13 12:37:30
 */

interface ImageLoaderOptions {
  // 默认头像的url
  defaultImageUrl: string
  onError?: (error: Error) => void
}
/**
 * 加载图片
 * @param url 图片地址
 */
export const loadImage = (imageUrl: string, options: ImageLoaderOptions) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve(img.src)
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    img.onerror = (err: any) => {
      if (options.onError) {
        options.onError(err)
      }

      resolve(options.defaultImageUrl)
    }

    img.src = imageUrl
  })
}
