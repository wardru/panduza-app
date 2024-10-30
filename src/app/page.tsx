
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Header from './header';

export default function Main() {
    return (
        <div className="bg-green-800 h-screen flex flex-col overflow-hidden">
            <Header/>
            <div className="text-white bg-gray-800 flex flex-col flex-grow overflow-auto">
                <SimpleTreeView className="bg-green-700 flex-grow">
                    <TreeItem itemId="1" label="1" />
                    <TreeItem itemId="2" label="2">
                        <TreeItem itemId="s1" label="2" />
                        <TreeItem itemId="s2" label="2" />
                        <TreeItem itemId="s3" label="3">
                            <TreeItem itemId="ww" label="32" />
                            <TreeItem itemId="w1" label="32" />
                            <TreeItem itemId="w2" label="32" />
                            <TreeItem itemId="w3" label="32" />
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
