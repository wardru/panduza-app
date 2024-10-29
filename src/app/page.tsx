import Image from 'next/image';
import PanduzaLogo from "../images/logo/logo_circle_black_blue_256.png";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const Header = () => {
    return (
        <div className="bg-header/100 w-full flex items-center py-1 px-3 sticky top-0">
            <div className="flex-shrink-0">
                <Image
                    src={PanduzaLogo}
                    width={27}
                    height={27}
                    alt="logo"
                />
            </div>
        </div>
    )
}

export default function Main() {
    return (
        <div>
            <Header />
            <div className="text-white">
                <SimpleTreeView className="">
                    <TreeItem itemId="1" label="1" />
                    <TreeItem itemId="2" label="2">
                        <TreeItem itemId="s1" label="2" />
                        <TreeItem itemId="s2" label="2" />
                        <TreeItem itemId="s3" label="3">
                            <TreeItem itemId="ww" label="32"/>
                            <TreeItem itemId="w1" label="32"/>
                            <TreeItem itemId="w2" label="32"/>
                            <TreeItem itemId="w3" label="32"/>
                        </TreeItem>
                    </TreeItem>
                    <TreeItem itemId="3" label="3">
                        <TreeItem itemId="p1" label="2" />
                        <TreeItem itemId="p2" label="2" />
                        <TreeItem itemId="p3" label="3" />
                    </TreeItem>
                    <TreeItem itemId="4" label="4" />
                </SimpleTreeView>
            </div>
        </div>
    );
}
