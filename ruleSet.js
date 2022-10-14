


export class PackageNode {

    constructor(packageName) {
        this.packageName = packageName,
        this.dependencies = []; // packages that this package requires
        this.requiredBy = []; // packages that requires this packages
    }

}


export class RuleSet {

    constructor() {
        this.packages = {}, //  all packages in the ruleSet
        this.exclusives = [] // list of set of exclusive packages {A,B} 
        this.selected = {} // all the selected packages using the toggle;
    }

}


export const makeRelationshipSet = () => {
    return new RuleSet()
}

const addNewPackage = (pack, dict) => {
    /**
     * create new packages or return it if it exists
     */
    if (dict[pack]) {
        return dict[pack];
    } else {
        dict[pack] = new PackageNode(pack);
        return dict[pack]
    }


}

export const dependsOn = (A, B, ruleSet) => {

    /**
     * adding the packages and creating the relations between them
     */

    const packA = addNewPackage(A, ruleSet.packages);
    const packB = addNewPackage(B, ruleSet.packages);
    packA.dependencies.push(packB)
    packB.requiredBy.push(packA)
    return ruleSet;
}

export const areExclusive = (A, B, ruleSet) => {
    /**
     * adding the exclusive sets
     */
    const packA = addNewPackage(A, ruleSet.packages);
    const packB = addNewPackage(B, ruleSet.packages);
    ruleSet.exclusives.push({ A:packA, B:packB })
    return ruleSet;
}


const checkRequired = (set) =>{
    /**
     * check if there is a path  between setA and setB
     */
    let currentPack = set.A;
    let relationState= true;
    let stack = [set.A]; // works as First in Last out (reverse queue)
    let history= {};  // keeps track of the pckages we already explored

    while(stack.length > 0 ){
        
        /** get the new package from the stack */
        currentPack = stack.pop();
        /**check if we explored before to skip it or procedd if not */
        if (history[currentPack.packageName]){
            continue;
        }

        /** check if we have our destination package*/
        if(currentPack == set.B ){
            relationState = false;
            break;
        };

        /** add the pckage to the explored packages */
        history[currentPack.packageName] = currentPack ;

        /** populate the stack with the new possible packages */
        stack.push(...currentPack.requiredBy, ...currentPack.dependencies);
        
    }

    return relationState;
}

export const checkRelationships = (ruleSet) => {
    /** 
     * for each exclusive validate that there is no path betwee A and b 
     */
    let relationState = true;

    ruleSet.exclusives.forEach(set =>{
        relationState = checkRequired(set);
    })

    return relationState

}

export const toggle = (selected, pack, ruleSet) =>{
    ruleSet.selected[pack] ? delete ruleSet.selected[pack]  :ruleSet.selected[pack] = ruleSet.packages[pack];
    return ruleSet.selected;
}
