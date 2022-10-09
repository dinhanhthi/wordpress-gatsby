import sys
import os
import json

json_path = '/Users/thi/Downloads/math2it/posts.json'
uploads_resize_path = '/Users/thi/Downloads/math2it/uploads_resize'
site_path = '/Users/thi/Local\ Sites/math2it-hsg/'


def main(fromIndex, toIndex):
    """
    Auto upload images to wordpress + assign featured images to posts
    """
    f = open(json_path, 'r')
    data = json.load(f)
    f.close()
    nodes = data['data']['posts']['nodes']
    total_posts = len(nodes)
    for idx, node in enumerate(nodes[int(fromIndex):int(toIndex)]):
        image_name = node['featuredImage']['node']['sourceUrl'].split(
            '/')[-1] if node['featuredImage'] else 'math.png'
        post_id = node['databaseId']
        post_title = node['title']
        cmd = f'wp media import --post_id={post_id} --featured_image {uploads_resize_path}/{image_name}'
        os.system(f'cd {site_path} && {cmd}')
        print(
            f'✅ [{idx + int(fromIndex)} / {total_posts}] Assigned featured image "{image_name}" to post "{post_title}"')


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
